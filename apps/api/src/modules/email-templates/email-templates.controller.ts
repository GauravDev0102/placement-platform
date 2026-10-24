import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('email-templates')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class EmailTemplatesController {
  constructor(private service: EmailTemplatesService) {}

  @Get()
  @Permissions('email-templates:manage')
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @Permissions('email-templates:manage')
  findById(@Param('id') id: string) { return this.service.findById(id); }

  @Post()
  @Permissions('email-templates:manage')
  create(@Body() body: { name: string; subject: string; body: string; variables?: string[] }) {
    return this.service.create(body);
  }

  @Patch(':id')
  @Permissions('email-templates:manage')
  update(@Param('id') id: string, @Body() body: { name?: string; subject?: string; body?: string; variables?: string[] }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Permissions('email-templates:manage')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
