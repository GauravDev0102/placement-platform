import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  @Permissions('analytics:view')
  getOverview() { return this.analyticsService.getOverview(); }

  @Get('applications')
  @Permissions('analytics:view')
  getApplicationStats() { return this.analyticsService.getApplicationStats(); }

  @Get('jobs')
  @Permissions('analytics:view')
  getJobStats() { return this.analyticsService.getJobStats(); }

  @Get('companies')
  @Permissions('analytics:view')
  getCompanyStats() { return this.analyticsService.getCompanyStats(); }

  @Get('timeline')
  @Permissions('analytics:view')
  getTimeline(@Query('days') days?: string) {
    return this.analyticsService.getTimeline(days ? parseInt(days, 10) : 30);
  }
}
