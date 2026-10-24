import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Get()
  @Permissions('departments:manage')
  findAll() {
    return this.departmentsService.findAll();
  }

  @Post()
  @Permissions('departments:manage')
  create(@Body('name') name: string) {
    return this.departmentsService.create(name);
  }

  @Delete(':id')
  @Permissions('departments:manage')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
