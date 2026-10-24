import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { ResumeParserModule } from '../resume-parser/resume-parser.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [ResumeParserModule, EventsModule],
  controllers: [ResumeController],
  providers: [ResumeService],
  exports: [ResumeService],
})
export class ResumeModule {}
