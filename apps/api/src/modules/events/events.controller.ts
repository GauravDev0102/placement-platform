import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  // own activity feed — any authenticated user
  @UseGuards(JwtAuthGuard)
  @Get()
  findByUser(@CurrentUser('id') userId: string, @Query('limit') limit?: string) {
    return this.eventsService.findByUser(userId, limit ? parseInt(limit, 10) : 50);
  }

  // global feed — admin/officer oversight only
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('audit:export')
  @Get('all')
  findAll(@Query('limit') limit?: string) {
    return this.eventsService.findAll(limit ? parseInt(limit, 10) : 100);
  }
}
