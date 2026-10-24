import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async findByApplication(applicationId: string) {
    return this.prisma.note.findMany({
      where: { applicationId },
      include: {
        recruiter: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStudent(studentId: string) {
    return this.prisma.note.findMany({
      where: { studentId },
      include: {
        recruiter: { select: { id: true, name: true } },
        application: { select: { id: true, job: { select: { title: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    recruiterId: string;
    studentId: string;
    applicationId?: string;
    content: string;
  }) {
    return this.prisma.note.create({
      data,
      include: {
        recruiter: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.recruiterId !== userId) throw new NotFoundException('Not your note');
    return this.prisma.note.delete({ where: { id } });
  }
}
