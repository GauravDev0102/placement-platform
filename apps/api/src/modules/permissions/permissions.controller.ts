import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Role } from '@prisma/client';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get()
  @Permissions('permissions:list')
  getAll() {
    return this.permissionsService.getAllPermissions();
  }

  @Get(':role')
  @Permissions('permissions:list')
  getRolePermissions(@Param('role') role: Role) {
    return this.permissionsService.getRolePermissions(role);
  }

  @Post(':role/:permissionId')
  @Permissions('permissions:manage')
  assignPermission(
    @Param('role') role: Role,
    @Param('permissionId') permissionId: string,
  ) {
    return this.permissionsService.assignPermission(role, permissionId);
  }

  @Delete(':role/:permissionId')
  @Permissions('permissions:manage')
  removePermission(
    @Param('role') role: Role,
    @Param('permissionId') permissionId: string,
  ) {
    return this.permissionsService.removePermission(role, permissionId);
  }
}
