import { Controller, Get, Post, Delete, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ResumeService } from './resume.service';
import { ResumeParserService } from '../resume-parser/resume-parser.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LogAction } from '../../common/decorators/log-action.decorator';

@Controller('resume')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ResumeController {
  constructor(
    private resumeService: ResumeService,
    private resumeParserService: ResumeParserService,
  ) {}

  @Get('my')
  @Permissions('resumes:read')
  getMyResumes(@CurrentUser('id') userId: string) {
    return this.resumeService.findByUser(userId);
  }

  @Get('student/:studentId')
  @Permissions('resumes:read')
  getStudentResumes(
    @Param('studentId') studentId: string,
    @CurrentUser() user: any,
  ) {
    if (user.role === 'STUDENT' && user.id !== studentId) {
      throw new ForbiddenException('Cannot view other students resumes');
    }
    return this.resumeService.findByUser(studentId);
  }

  @Post('upload')
  @Permissions('resumes:upload')
  @LogAction('UPLOAD_RESUME', 'RESUME')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '../../../uploads/resumes'),
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(new BadRequestException('Only PDF files are allowed'), false);
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const fileUrl = `/uploads/resumes/${file.filename}`;
    let resume = await this.resumeService.upload(userId, fileUrl, file.originalname);
    try {
      await this.resumeParserService.parse(resume.id);
      resume = (await this.resumeService.findById(resume.id)) ?? resume;
    } catch (e) {
      console.warn(`Resume parse failed for ${resume.id}:`, (e as Error)?.message);
    }
    return resume;
  }

  @Post(':id/parse')
  @Permissions('resumes:upload')
  parse(@Param('id') id: string) {
    return this.resumeParserService.parse(id);
  }

  @Delete(':id')
  @Permissions('resumes:delete')
  @LogAction('DELETE_RESUME', 'RESUME')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.resumeService.remove(id, userId);
  }
}
