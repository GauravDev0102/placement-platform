import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
  ) {}

  async findAll() {
    return this.prisma.company.findMany({
      include: {
        recruiters: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { jobs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        recruiters: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        jobs: {
          where: { status: 'PUBLISHED' },
          include: {
            jobSkills: { include: { skill: true } },
            _count: { select: { applications: true } },
          },
        },
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async create(dto: CreateCompanyDto, userId: string) {
    const existing = await this.prisma.company.findFirst({
      where: { name: { equals: dto.name, mode: 'insensitive' } },
    });
    if (existing) throw new ConflictException('Company already exists');

    const company = await this.prisma.company.create({
      data: { name: dto.name, description: dto.description, website: dto.website, logo: dto.logo },
    });

    await this.prisma.recruiter.create({
      data: { userId, companyId: company.id, designation: dto.designation },
    });

    await this.eventsService.create({
      userId,
      action: 'CREATED_COMPANY',
      description: `Registered company ${company.name}`,
      entityType: 'COMPANY',
      entityId: company.id,
    });

    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findById(id);
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async verify(id: string) {
    await this.findById(id);
    return this.prisma.company.update({ where: { id }, data: { verified: true } });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.company.delete({ where: { id } });
  }
}
