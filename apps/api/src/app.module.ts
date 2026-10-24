import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { TagsModule } from './modules/tags/tags.module';
import { NotesModule } from './modules/notes/notes.module';
import { ResumeModule } from './modules/resume/resume.module';
import { RecruitersModule } from './modules/recruiters/recruiters.module';
import { SavedSearchesModule } from './modules/saved-searches/saved-searches.module';
import { StudentsModule } from './modules/students/students.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailTemplatesModule } from './modules/email-templates/email-templates.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ResumeParserModule } from './modules/resume-parser/resume-parser.module';
import { EventsModule } from './modules/events/events.module';
import { DrivesModule } from './modules/drives/drives.module';
import { HealthController } from './common/health.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    PermissionsModule,
    AuditLogModule,
    CompaniesModule,
    JobsModule,
    ApplicationsModule,
    DepartmentsModule,
    TagsModule,
    NotesModule,
    ResumeModule,
    RecruitersModule,
    SavedSearchesModule,
    StudentsModule,
    NotificationsModule,
    EmailTemplatesModule,
    CalendarModule,
    AnalyticsModule,
    ResumeParserModule,
    EventsModule,
    DrivesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
