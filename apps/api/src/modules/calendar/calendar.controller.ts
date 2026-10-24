import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('calendar')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get()
  @Permissions('interviews:read')
  findEvents(
    @CurrentUser() user: { id: string; role: string },
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.calendarService.findEvents(user, start, end);
  }
}
