import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LogAction } from '../../common/decorators/log-action.decorator';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Get()
  @Permissions('applications:list')
  findAll(@Query() query: { studentId?: string; jobId?: string; status?: string }) {
    return this.applicationsService.findAll(query);
  }

  @Get('pipeline/:jobId')
  @Permissions('applications:list')
  getPipeline(@Param('jobId') jobId: string) {
    return this.applicationsService.getPipeline(jobId);
  }

  @Get('dashboard')
  getDashboardStats(@CurrentUser('id') userId: string) {
    return this.applicationsService.getDashboardStats(userId);
  }

  @Get(':id')
  @Permissions('applications:read')
  findById(@Param('id') id: string) {
    return this.applicationsService.findById(id);
  }

  @Post()
  @Permissions('applications:create')
  @LogAction('CREATE_APPLICATION', 'APPLICATION')
  create(@Body() dto: CreateApplicationDto, @CurrentUser('id') userId: string) {
    return this.applicationsService.create(dto, userId);
  }

  @Patch(':id/advance')
  @Permissions('applications:update')
  @LogAction('ADVANCE_APPLICATION', 'APPLICATION')
  advanceStage(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.applicationsService.advanceStage(id, dto, userId);
  }

  @Patch(':id/reject')
  @Permissions('applications:update')
  @LogAction('REJECT_APPLICATION', 'APPLICATION')
  reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.applicationsService.reject(id, reason);
  }
}
