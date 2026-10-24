import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LogAction } from '../../common/decorators/log-action.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  @Permissions('jobs:list')
  findAll(@Query() query: { companyId?: string; status?: string }) {
    return this.jobsService.findAll(query);
  }

  @Get(':id')
  @Permissions('jobs:read')
  findById(
    @Param('id') id: string,
    @CurrentUser() user?: { id: string; role: string },
  ) {
    // only students view application status scoped to themselves
    return this.jobsService.findById(id, user?.role === 'STUDENT' ? user.id : undefined);
  }

  @Get(':id/eligibility')
  async checkEligibility(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const job = await this.jobsService.findById(id);
    return this.jobsService.checkEligibility(job, userId);
  }

  @Post('company/:companyId')
  @Permissions('jobs:create')
  @LogAction('CREATE_JOB', 'JOB')
  create(
    @Body() dto: CreateJobDto,
    @Param('companyId') companyId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.jobsService.create(dto, companyId, userId);
  }

  @Patch(':id')
  @Permissions('jobs:update')
  @LogAction('UPDATE_JOB', 'JOB')
  update(@Param('id') id: string, @Body() dto: UpdateJobDto, @CurrentUser('id') userId: string) {
    return this.jobsService.update(id, dto, userId);
  }

  @Patch(':id/status')
  @Permissions('jobs:update')
  @LogAction('UPDATE_JOB_STATUS', 'JOB')
  updateStatus(@Param('id') id: string, @Body('status') status: string, @CurrentUser('id') userId: string) {
    return this.jobsService.updateStatus(id, status, userId);
  }

  @Delete(':id')
  @Permissions('jobs:delete')
  @LogAction('DELETE_JOB', 'JOB')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
