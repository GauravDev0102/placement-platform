import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @Get()
  @Permissions('audit:view')
  findAll(@Query() query: any) {
    return this.auditLogService.findAll(query);
  }
}
