import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DrivesService } from './drives.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LogAction } from '../../common/decorators/log-action.decorator';

@Controller('drives')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DrivesController {
  constructor(private drivesService: DrivesService) {}

  @Get()
  @Permissions('drives:read')
  findAll() {
    return this.drivesService.findAll();
  }

  @Post()
  @Permissions('drives:create')
  @LogAction('CREATE_DRIVE', 'DRIVE')
  create(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.drivesService.create(body, userId);
  }

  @Patch(':id/status')
  @Permissions('drives:update')
  @LogAction('UPDATE_DRIVE_STATUS', 'DRIVE')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.drivesService.updateStatus(id, status);
  }

  @Delete(':id')
  @Permissions('drives:delete')
  @LogAction('DELETE_DRIVE', 'DRIVE')
  remove(@Param('id') id: string) {
    return this.drivesService.remove(id);
  }
}
