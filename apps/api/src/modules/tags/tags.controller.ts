import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tags')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Get()
  @Permissions('tags:manage')
  findAll() {
    return this.tagsService.findAll();
  }

  @Post()
  @Permissions('tags:manage')
  create(@Body('name') name: string, @Body('color') color?: string) {
    return this.tagsService.create(name, color);
  }

  @Delete(':id')
  @Permissions('tags:manage')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }

  @Post('assign/:candidateId/:tagId')
  @Permissions('tags:manage')
  assignToCandidate(
    @Param('candidateId') candidateId: string,
    @Param('tagId') tagId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.tagsService.assignToCandidate(tagId, candidateId, userId);
  }

  @Delete('assign/:candidateId/:tagId')
  @Permissions('tags:manage')
  removeFromCandidate(
    @Param('candidateId') candidateId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.tagsService.removeFromCandidate(tagId, candidateId);
  }

  @Get('candidate/:candidateId')
  @Permissions('tags:manage')
  getCandidateTags(@Param('candidateId') candidateId: string) {
    return this.tagsService.getCandidateTags(candidateId);
  }
}
