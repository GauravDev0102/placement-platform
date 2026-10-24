import { Controller, Get, UseGuards } from '@nestjs/common';
import { RecruitersService } from './recruiters.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('recruiters')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RecruitersController {
  constructor(private recruitersService: RecruitersService) {}

  @Get('dashboard')
  @Permissions('analytics:view')
  getDashboard(@CurrentUser('id') userId: string) {
    return this.recruitersService.getDashboard(userId);
  }

  @Get('my-company')
  getMyCompany(@CurrentUser('id') userId: string) {
    return this.recruitersService.getMyCompany(userId);
  }
}
