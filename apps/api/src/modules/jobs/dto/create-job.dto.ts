import { IsString, IsOptional, IsNumber, IsArray, IsEnum } from 'class-validator';
import { JobStatus } from '@prisma/client';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  package?: string;

  @IsOptional()
  @IsNumber()
  minCGPA?: number;

  @IsOptional()
  @IsNumber()
  maxBacklogs?: number;

  @IsOptional()
  @IsArray()
  allowedBranches?: string[];

  @IsOptional()
  @IsArray()
  skillIds?: string[];

  @IsOptional()
  deadline?: string;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}
