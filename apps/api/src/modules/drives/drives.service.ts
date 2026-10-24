import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DrivesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.placementDrive.findMany({
      include: {
        company: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async create(data: {
    title: string;
    companyId: string;
    stages: string[];
    startDate?: string;
    endDate?: string;
  }, userId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: data.companyId } });
    if (!company) throw new NotFoundException('Company not found');

    const stageNames = data.stages?.length ? data.stages : ['APTITUDE', 'TECHNICAL', 'HR'];

    return this.prisma.placementDrive.create({
      data: {
        title: data.title,
        companyId: data.companyId,
        stages: stageNames,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        createdBy: userId,
      },
      include: {
        company: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const drive = await this.prisma.placementDrive.findUnique({ where: { id } });
    if (!drive) throw new NotFoundException('Drive not found');

    return this.prisma.placementDrive.update({
      where: { id },
      data: { status },
      include: {
        company: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string) {
    const drive = await this.prisma.placementDrive.findUnique({ where: { id } });
    if (!drive) throw new NotFoundException('Drive not found');

    return this.prisma.placementDrive.delete({ where: { id } });
  }
}
