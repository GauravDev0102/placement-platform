import { Controller, Get, Param, Patch, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Permissions('users:list')
  findAll(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }

  @Get(':id')
  @Permissions('users:read')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('profile')
  updateProfile(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.usersService.updateProfile(userId, data);
  }

  @Patch(':id/toggle-active')
  @Permissions('users:manage')
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }
}
