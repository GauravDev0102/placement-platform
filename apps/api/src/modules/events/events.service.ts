import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityEntityType } from '@prisma/client';
import { EventsGateway } from './events.gateway';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private gateway: EventsGateway,
  ) {}

  async create(data: {
    userId: string;
    action: string;
    description: string;
    entityType: ActivityEntityType;
    entityId?: string;
    metadata?: any;
  }) {
    const activity = await this.prisma.activityFeed.create({
      data: {
        userId: data.userId,
        action: data.action,
        description: data.description,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata || undefined,
      },
      include: { user: { select: { name: true, role: true } } },
    });

    this.gateway.sendToUser(data.userId, 'activity', activity);
    return activity;
  }

  async findByUser(userId: string, limit = 50) {
    return this.prisma.activityFeed.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { name: true, role: true } } },
    });
  }

  async findAll(limit = 100) {
    return this.prisma.activityFeed.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { name: true, role: true } } },
    });
  }
}
