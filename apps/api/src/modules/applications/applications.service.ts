import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsService } from '../events/events.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  private readonly STAGE_ORDER: ApplicationStatus[] = [
    'APPLIED',
    'RESUME_SHORTLISTED',
    'CODING_ROUND',
    'TECHNICAL_INTERVIEW',
    'HR_INTERVIEW',
    'OFFER',
    'JOINED',
  ];

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsService: EventsService,
  ) {}

  async findAll(query: { studentId?: string; jobId?: string; status?: string }) {    const where: any = {};
    if (query.studentId) where.studentId = query.studentId;
    if (query.jobId) where.jobId = query.jobId;
    if (query.status) where.status = query.status;

    return this.prisma.application.findMany({
      where,
      include: {
        job: { include: { company: true, jobSkills: { include: { skill: true } } } },
        student: { select: { id: true, name: true, email: true } },
        stageDetails: { orderBy: { stageOrder: 'asc' } },
        notes: { include: { recruiter: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        job: { include: { company: true, jobSkills: { include: { skill: true } } } },
        student: {
          select: {
            id: true, name: true, email: true, profile: true,
            resumes: { orderBy: { version: 'desc' } },
          },
        },
        stageDetails: { orderBy: { stageOrder: 'asc' } },
        interviews: true,
        notes: { include: { recruiter: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async create(dto: CreateApplicationDto, studentId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.status !== 'PUBLISHED') throw new BadRequestException('Job is not accepting applications');

    const existing = await this.prisma.application.findUnique({
      where: { studentId_jobId: { studentId, jobId: dto.jobId } },
    });
    if (existing) throw new ConflictException('Already applied to this job');

    const profile = await this.prisma.profile.findUnique({ where: { userId: studentId } });

    const hasResume = await this.prisma.resume.findFirst({ where: { userId: studentId } });
    if (!hasResume) {
      throw new BadRequestException('Upload your resume before applying');
    }

    let eligibilityStatus = 'ELIGIBLE';
    let eligibilityReason: string | null = null;

    if (job.minCGPA && (profile?.cgpa ?? 0) < job.minCGPA) {
      eligibilityStatus = 'INELIGIBLE';
      eligibilityReason = `CGPA ${profile?.cgpa ?? 'N/A'} < required ${job.minCGPA}`;
    } else if (job.maxBacklogs !== null && job.maxBacklogs !== undefined && (profile?.backlogs ?? 0) > job.maxBacklogs) {
      eligibilityStatus = 'INELIGIBLE';
      eligibilityReason = `Backlogs ${profile?.backlogs} > max allowed ${job.maxBacklogs}`;
    } else if (job.allowedBranches?.length && profile?.branch) {
      const studentBranch = profile.branch.trim().toUpperCase();
      const isWildcard = job.allowedBranches.some(
        (b: string) => ['ANY', 'ALL'].includes(b.trim().toUpperCase()),
      );
      const branchMatches = job.allowedBranches.some(
        (b: string) => b.trim().toUpperCase() === studentBranch,
      );
      if (!isWildcard && !branchMatches) {
        eligibilityStatus = 'INELIGIBLE';
        eligibilityReason = `Branch ${profile.branch} not in allowed list`;
      }
    }

    const application = await this.prisma.application.create({
      data: {
        studentId,
        jobId: dto.jobId,
        eligibilityStatus,
        eligibilityReason,
        currentStageName: 'APPLIED',
        stageDetails: {
          create: { stageName: 'APPLIED', stageOrder: 0, status: 'APPLIED' },
        },
      },
      include: {
        job: { include: { company: { include: { recruiters: true } } } },
        student: { select: { name: true } },
        stageDetails: true,
      },
    });

    for (const recruiter of application.job.company.recruiters) {
      await this.notificationsService.create({
        userId: recruiter.userId,
        type: 'APPLICATION_RECEIVED',
        title: 'New Application Received',
        message: `${application.student.name} applied for ${application.job.title}`,
      });
    }

    const company = await this.prisma.company.findUnique({
      where: { id: application.job.companyId },
      select: { name: true },
    });

    await this.eventsService.create({
      userId: studentId,
      action: 'APPLIED',
      description: `Applied to ${application.job.title} at ${company?.name ?? 'a company'}`,
      entityType: 'APPLICATION',
      entityId: application.id,
    });

    return application;
  }

  async advanceStage(id: string, dto: UpdateApplicationDto, userId: string) {
    const app = await this.findById(id);
    const currentIndex = this.STAGE_ORDER.indexOf(app.status as ApplicationStatus);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= this.STAGE_ORDER.length) {
      throw new BadRequestException('Already at final stage');
    }

    const nextStage = this.STAGE_ORDER[nextIndex];
    const stageName = dto.currentStageName || nextStage;

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status: nextStage,
        currentStage: nextIndex,
        currentStageName: stageName,
        stageDetails: {
          create: {
            stageName,
            stageOrder: nextIndex,
            status: nextStage,
            feedback: dto.feedback,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
          },
        },
      },
      include: {
        job: { include: { company: true } },
        stageDetails: { orderBy: { stageOrder: 'asc' } },
      },
    });

    await this.notificationsService.create({
      userId: updated.studentId,
      type: 'APPLICATION_ADVANCED',
      title: 'Application Status Updated',
      message: `Your application for ${updated.job.title} (${updated.job.company.name}) moved to ${stageName.replace(/_/g, ' ')}`,
    });

    await this.eventsService.create({
      userId: updated.studentId,
      action: 'APPLICATION_ADVANCED',
      description: `Moved to ${stageName.replace(/_/g, ' ')} for ${updated.job.title}`,
      entityType: 'APPLICATION',
      entityId: id,
    });

    return updated;
  }

  async reject(id: string, reason?: string) {
    const app = await this.findById(id);
    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status: 'REJECTED',
        stageDetails: {
          create: {
            stageName: 'REJECTED',
            stageOrder: 99,
            status: 'REJECTED',
            feedback: reason,
          },
        },
      },
      include: { job: { include: { company: true } } },
    });

    await this.notificationsService.create({
      userId: app.studentId,
      type: 'APPLICATION_REJECTED',
      title: 'Application Rejected',
      message: `Your application for ${updated.job.title} (${updated.job.company.name}) was rejected${reason ? `: ${reason}` : ''}`,
    });

    await this.eventsService.create({
      userId: app.studentId,
      action: 'APPLICATION_REJECTED',
      description: `Application for ${updated.job.title} was rejected${reason ? `: ${reason}` : ''}`,
      entityType: 'APPLICATION',
      entityId: id,
    });

    return updated;
  }

  async getPipeline(jobId: string) {
    const stages = this.STAGE_ORDER;
    const pipeline: Record<string, any[]> = {};

    for (const stage of stages) {
      pipeline[stage] = [];
    }
    pipeline['REJECTED'] = [];

    const applications = await this.prisma.application.findMany({
      where: { jobId },
      include: {
        student: { select: { id: true, name: true, email: true, profile: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });

    for (const app of applications) {
      const stage = pipeline[app.status] ? app.status : 'REJECTED';
      pipeline[stage].push(app);
    }

    return pipeline;
  }

  async getDashboardStats(studentId: string) {
    const applications = await this.prisma.application.findMany({
      where: { studentId },
    });

    return {
      total: applications.length,
      selected: applications.filter((a) => a.status === 'OFFER' || a.status === 'JOINED').length,
      rejected: applications.filter((a) => a.status === 'REJECTED').length,
      inProgress: applications.filter(
        (a) => !['OFFER', 'JOINED', 'REJECTED'].includes(a.status),
      ).length,
    };
  }
}
