import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecruitersService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
    });
    if (!recruiter) return null;

    const jobs = await this.prisma.job.findMany({
      where: { companyId: recruiter.companyId },
      include: {
        _count: { select: { applications: true } },
        applications: {
          select: { status: true },
        },
      },
    });

    const totalApplications = jobs.reduce((sum, j) => sum + j._count.applications, 0);
    const allStatuses = jobs.flatMap((j) => j.applications.map((a) => a.status));
    const selected = allStatuses.filter((s) => s === 'OFFER' || s === 'JOINED').length;
    const rejected = allStatuses.filter((s) => s === 'REJECTED').length;
    const inProgress = allStatuses.filter(
      (s) => !['OFFER', 'JOINED', 'REJECTED'].includes(s),
    ).length;

    return {
      totalJobs: jobs.length,
      totalApplications,
      selected,
      rejected,
      inProgress,
      acceptanceRate: totalApplications > 0 ? Math.round((selected / totalApplications) * 100) : 0,
      interviewConversion: totalApplications > 0
        ? Math.round((allStatuses.filter((s) => s !== 'APPLIED').length / totalApplications) * 100)
        : 0,
    };
  }

  async getMyCompany(userId: string) {
    return this.prisma.recruiter.findUnique({
      where: { userId },
      include: { company: true },
    });
  }
}
