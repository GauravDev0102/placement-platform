import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany({
      include: { _count: { select: { candidates: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(name: string, color?: string) {
    return this.prisma.tag.create({ data: { name, color: color || '#6366f1' } });
  }

  async remove(id: string) {
    return this.prisma.tag.delete({ where: { id } });
  }

  async assignToCandidate(tagId: string, candidateId: string, addedBy: string) {
    return this.prisma.candidateTag.create({
      data: { tagId, candidateId, addedBy },
      include: { tag: true },
    });
  }

  async removeFromCandidate(tagId: string, candidateId: string) {
    return this.prisma.candidateTag.delete({
      where: { candidateId_tagId: { candidateId, tagId } },
    });
  }

  async getCandidateTags(candidateId: string) {
    return this.prisma.candidateTag.findMany({
      where: { candidateId },
      include: { tag: true, addedByUser: { select: { name: true } } },
    });
  }
}
