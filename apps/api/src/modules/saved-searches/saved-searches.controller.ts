import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('saved-searches')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SavedSearchesController {
  constructor(private savedSearchesService: SavedSearchesService) {}

  @Get()
  @Permissions('saved-searches:manage')
  findByUser(@CurrentUser('id') userId: string) {
    return this.savedSearchesService.findByUser(userId);
  }

  @Post()
  @Permissions('saved-searches:manage')
  create(
    @CurrentUser('id') userId: string,
    @Body('name') name: string,
    @Body('filters') filters: any,
  ) {
    return this.savedSearchesService.create(userId, name, filters);
  }

  @Delete(':id')
  @Permissions('saved-searches:manage')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.savedSearchesService.remove(id, userId);
  }
}
