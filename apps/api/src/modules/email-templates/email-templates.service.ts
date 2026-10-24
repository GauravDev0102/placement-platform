import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmailTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.emailTemplate.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    const tpl = await this.prisma.emailTemplate.findUnique({ where: { id } });
    if (!tpl) throw new NotFoundException('Template not found');
    return tpl;
  }

  async create(data: { name: string; subject: string; body: string; variables?: string[] }) {
    return this.prisma.emailTemplate.create({ data });
  }

  async update(id: string, data: { name?: string; subject?: string; body?: string; variables?: string[] }) {
    await this.findById(id);
    return this.prisma.emailTemplate.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.emailTemplate.delete({ where: { id } });
  }
}
