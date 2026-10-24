import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LogAction } from '../../common/decorators/log-action.decorator';

@Controller('notes')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get('application/:applicationId')
  @Permissions('notes:read')
  findByApplication(@Param('applicationId') applicationId: string) {
    return this.notesService.findByApplication(applicationId);
  }

  @Get('student/:studentId')
  @Permissions('notes:read')
  findByStudent(@Param('studentId') studentId: string) {
    return this.notesService.findByStudent(studentId);
  }

  @Post()
  @Permissions('notes:create')
  @LogAction('CREATE_NOTE', 'NOTE')
  create(
    @Body() body: { studentId: string; applicationId?: string; content: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.notesService.create({
      recruiterId: userId,
      studentId: body.studentId,
      applicationId: body.applicationId,
      content: body.content,
    });
  }

  @Delete(':id')
  @Permissions('notes:create')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notesService.remove(id, userId);
  }
}
