import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async search(query: {
    skills?: string;
    branch?: string;
    cgpaMin?: string;
    cgpaMax?: string;
    backlogsMax?: string;
    batch?: string;
    page?: string;
    limit?: string;
  }) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = { role: 'STUDENT', isActive: true };

    if (query.branch) {
      where.profile = { ...where.profile, branch: query.branch };
    }

    if (query.cgpaMin || query.cgpaMax) {
      const cgpaFilter: any = {};
      if (query.cgpaMin) cgpaFilter.gte = parseFloat(query.cgpaMin);
      if (query.cgpaMax) cgpaFilter.lte = parseFloat(query.cgpaMax);
      where.profile = { ...where.profile, cgpa: cgpaFilter };
    }

    if (query.backlogsMax) {
      where.profile = { ...where.profile, backlogs: { lte: parseInt(query.backlogsMax) } };
    }

    if (query.batch) {
      where.profile = { ...where.profile, graduationYear: parseInt(query.batch) };
    }

    if (query.skills) {
      const skillNames = query.skills.split(',').map((s) => s.trim());
      where.userSkills = {
        some: { skill: { name: { in: skillNames } } },
      };
    }

    const [students, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          profile: true,
          userSkills: { include: { skill: true } },
          resumes: { orderBy: { version: 'desc' }, take: 1, select: { atsScore: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { students, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async compare(studentIds: string[]) {
    const students = await this.prisma.user.findMany({
      where: { id: { in: studentIds }, role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        profile: true,
        userSkills: { include: { skill: true } },
        projects: { take: 3, orderBy: { startDate: 'desc' } },
        resumes: { orderBy: { version: 'desc' }, take: 1, select: { atsScore: true } },
      },
    });
    return students;
  }
}
