import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
  ) {}

  async findAll(query: { companyId?: string; status?: string; studentId?: string }) {
    const where: any = {};
    if (query.companyId) where.companyId = query.companyId;
    if (query.status) where.status = query.status;

    if (query.studentId) {
      const student = await this.prisma.profile.findUnique({
        where: { userId: query.studentId },
      });
      if (student) {
        where.status = 'PUBLISHED';
      }
    }

    return this.prisma.job.findMany({
      where,
      include: {
        company: true,
        jobSkills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, studentId?: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        jobSkills: { include: { skill: true } },
        applications: studentId
          ? { where: { studentId } }
          : { include: { student: { select: { id: true, name: true, email: true } } } },
      },
    });
    if (!job) throw new NotFoundException('Job not found');

    let eligibility;
    if (studentId) {
      eligibility = await this.checkEligibility(job, studentId);
    }

    return { ...job, eligibility };
  }

  async create(dto: CreateJobDto, companyId: string, userId: string) {
    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
    });
    if (!recruiter || recruiter.companyId !== companyId) {
      throw new ForbiddenException('You are not a recruiter for this company');
    }

    const { skillIds, ...jobData } = dto;

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        companyId,
        jobSkills: skillIds?.length
          ? { create: skillIds.map((skillId) => ({ skillId })) }
          : undefined,
      },
      include: { company: true, jobSkills: { include: { skill: true } } },
    });

    await this.eventsService.create({
      userId,
      action: job.status === 'PUBLISHED' ? 'PUBLISHED_JOB' : 'CREATED_JOB',
      description: `Created job ${job.title} at ${job.company.name}`,
      entityType: 'JOB',
      entityId: job.id,
    });

    return job;
  }

  async update(id: string, dto: UpdateJobDto, userId: string) {
    const job = await this.findById(id);
    if (!job) throw new NotFoundException('Job not found');

    const skillIds = (dto as any).skillIds;
    const { skillIds: _, ...jobData } = dto as any;

    if (skillIds) {
      await this.prisma.jobSkill.deleteMany({ where: { jobId: id } });
      await this.prisma.jobSkill.createMany({
        data: skillIds.map((skillId: string) => ({ jobId: id, skillId })),
      });
    }

    return this.prisma.job.update({
      where: { id },
      data: {
        ...jobData,
        deadline: (dto as any).deadline ? new Date((dto as any).deadline) : undefined,
      },
      include: { company: true, jobSkills: { include: { skill: true } } },
    });
  }

  async updateStatus(id: string, status: string, userId: string) {
    const job = await this.findById(id);
    const updated = await this.prisma.job.update({
      where: { id },
      data: { status: status as any },
      include: { company: { select: { id: true, name: true } } },
    });
    if (job.status !== status) {
      await this.eventsService.create({
        userId,
        action: 'UPDATED_JOB_STATUS',
        description: `Job ${updated.title} status set to ${status}`,
        entityType: 'JOB',
        entityId: id,
      });
    }
    return updated;
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.job.delete({ where: { id } });
  }

  async checkEligibility(job: any, studentId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: studentId },
      include: { user: { include: { userSkills: { include: { skill: true } } } } },
    });

    if (!profile) return { eligible: false, reasons: ['Profile not found'] };

    const reasons: string[] = [];

    if (job.minCGPA && (profile.cgpa ?? 0) < job.minCGPA) {
      reasons.push(`CGPA ${profile.cgpa ?? 'N/A'} < required ${job.minCGPA}`);
    }

    if (job.maxBacklogs !== null && job.maxBacklogs !== undefined && (profile.backlogs ?? 0) > job.maxBacklogs) {
      reasons.push(`Backlogs ${profile.backlogs} > max allowed ${job.maxBacklogs}`);
    }

    if (job.allowedBranches?.length && profile.branch) {
      const studentBranch = profile.branch.trim().toUpperCase();
      const isWildcard = job.allowedBranches.some(
        (b: string) => ['ANY', 'ALL'].includes(b.trim().toUpperCase()),
      );
      const branchMatches = job.allowedBranches.some(
        (b: string) => b.trim().toUpperCase() === studentBranch,
      );
      if (!isWildcard && !branchMatches) {
        reasons.push(`Branch ${profile.branch} not in allowed list`);
      }
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    };
  }
}
