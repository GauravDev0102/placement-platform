import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SavedSearchesService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { recruiterId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, name: string, filters: any) {
    return this.prisma.savedSearch.create({
      data: { recruiterId: userId, name, filters },
    });
  }

  async remove(id: string, userId: string) {
    const search = await this.prisma.savedSearch.findUnique({ where: { id } });
    if (!search || search.recruiterId !== userId) return null;
    return this.prisma.savedSearch.delete({ where: { id } });
  }
}
