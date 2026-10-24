import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  currentStage?: number;

  @IsOptional()
  @IsString()
  currentStageName?: string;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
