import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('students')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get('search')
  @Permissions('users:list')
  search(@Query() query: any) {
    return this.studentsService.search(query);
  }

  @Post('compare')
  @Permissions('users:list')
  compare(@Body('studentIds') studentIds: string[]) {
    return this.studentsService.compare(studentIds);
  }
}
