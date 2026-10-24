import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class ResumeService {
  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
  ) {}

  async findByUser(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: { version: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.resume.findUnique({ where: { id } });
  }

  async upload(userId: string, fileUrl: string, originalName?: string) {
    const latest = await this.prisma.resume.findFirst({
      where: { userId },
      orderBy: { version: 'desc' },
    });

    const version = latest ? latest.version + 1 : 1;

    const resume = await this.prisma.resume.create({
      data: {
        userId,
        fileUrl,
        version,
        parsedData: { fileName: originalName, uploadedAt: new Date().toISOString() },
      },
    });

    await this.eventsService.create({
      userId,
      action: 'UPLOADED_RESUME',
      description: `Uploaded resume v${version}${originalName ? ` (${originalName})` : ''}`,
      entityType: 'RESUME',
      entityId: resume.id,
    });

    return resume;
  }

  async remove(id: string, userId: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new BadRequestException('Not your resume');
    return this.prisma.resume.delete({ where: { id } });
  }
}
