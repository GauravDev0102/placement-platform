import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({ orderBy: { name: 'asc' } });
  }

  async create(name: string) {
    const existing = await this.prisma.department.findUnique({ where: { name } });
    if (existing) throw new ConflictException('Department already exists');
    return this.prisma.department.create({ data: { name } });
  }

  async remove(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }
}
