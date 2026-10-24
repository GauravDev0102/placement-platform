import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async findEvents(user: { id: string; role: string }, start?: string, end?: string) {
    const whereStart = start ? new Date(start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const whereEnd = end ? new Date(end) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    // recruiters see their company's events, students their own, admin/officer everything
    const createdByRole = user.role === 'RECRUITER'
      ? { application: { job: { company: { recruiters: { some: { userId: user.id } } } } } }
      : user.role === 'STUDENT'
        ? { application: { studentId: user.id } }
        : {};

    const interviews = await this.prisma.interview.findMany({
      where: {
        scheduledAt: { gte: whereStart, lte: whereEnd },
        ...createdByRole,
      },
      include: {
        application: {
          select: {
            id: true,
            student: { select: { name: true } },
            job: { select: { title: true } },
          },
        },
      },
    });

    const stages = await this.prisma.interviewStage.findMany({
      where: {
        scheduledAt: { gte: whereStart, lte: whereEnd },
        ...createdByRole,
      },
      include: {
        application: {
          select: {
            id: true,
            student: { select: { name: true } },
            job: { select: { title: true } },
          },
        },
      },
    });

    return [
      ...interviews.map((i) => ({
        id: i.id,
        title: `Interview: ${i.application.student.name} - ${i.application.job.title}`,
        start: i.scheduledAt,
        type: 'interview' as const,
        meetLink: i.meetLink,
        interviewer: i.interviewer,
        applicationId: i.applicationId,
      })),
      ...stages.map((s) => ({
        id: s.id,
        title: `${s.stageName.replace(/_/g, ' ')}: ${s.application.student.name} - ${s.application.job.title}`,
        start: s.scheduledAt,
        type: 'stage' as const,
        status: s.status,
        applicationId: s.applicationId,
      })),
    ].sort((a, b) => (a.start?.getTime() || 0) - (b.start?.getTime() || 0));
  }
}
