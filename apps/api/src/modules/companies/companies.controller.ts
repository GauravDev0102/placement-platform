import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LogAction } from '../../common/decorators/log-action.decorator';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get()
  @Permissions('companies:list')
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @Permissions('companies:read')
  findById(@Param('id') id: string) {
    return this.companiesService.findById(id);
  }

  @Post()
  @Permissions('companies:create')
  @LogAction('CREATE_COMPANY', 'COMPANY')
  create(@Body() dto: CreateCompanyDto, @CurrentUser('id') userId: string) {
    return this.companiesService.create(dto, userId);
  }

  @Patch(':id')
  @Permissions('companies:update')
  @LogAction('UPDATE_COMPANY', 'COMPANY')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Patch(':id/verify')
  @Permissions('companies:update')
  @LogAction('VERIFY_COMPANY', 'COMPANY')
  verify(@Param('id') id: string) {
    return this.companiesService.verify(id);
  }

  @Delete(':id')
  @Permissions('companies:delete')
  @LogAction('DELETE_COMPANY', 'COMPANY')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
