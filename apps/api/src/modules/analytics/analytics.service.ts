import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [totalUsers, totalCompanies, totalJobs, totalApplications] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.company.count(),
      this.prisma.job.count(),
      this.prisma.application.count(),
    ]);
    return { totalUsers, totalCompanies, totalJobs, totalApplications };
  }

  async getApplicationStats() {
    const applications = await this.prisma.application.groupBy({
      by: ['currentStageName'],
      _count: { id: true },
    });
    const total = applications.reduce((s, g) => s + g._count.id, 0);
    return {
      total,
      stages: applications.map((g) => ({ stage: g.currentStageName, count: g._count.id })),
    };
  }

  async getJobStats() {
    const byStatus = await this.prisma.job.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    return {
      byStatus: byStatus.map((g) => ({ status: g.status, count: g._count.id })),
    };
  }

  async getCompanyStats() {
    const companies = await this.prisma.company.findMany({
      include: { _count: { select: { jobs: true } } },
    });
    return {
      total: companies.length,
      verified: companies.filter((c) => c.verified).length,
      unverified: companies.filter((c) => !c.verified).length,
      byJobsCount: companies.map((c) => ({
        name: c.name,
        jobsCount: c._count.jobs,
      })),
    };
  }

  async getTimeline(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const applications = await this.prisma.application.findMany({
      where: { appliedAt: { gte: since } },
      select: { appliedAt: true },
    });
    const timeline: Record<string, number> = {};
    for (const app of applications) {
      const key = app.appliedAt.toISOString().slice(0, 10);
      timeline[key] = (timeline[key] || 0) + 1;
    }
    return Object.entries(timeline).map(([date, count]) => ({ date, count }));
  }
}
