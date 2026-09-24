import { IsString, IsArray, IsOptional } from 'class-validator';

export class SkillGapSummaryDto {
  @IsOptional()
  @IsString()
  targetRole?: string;

  @IsOptional()
  @IsArray()
  currentSkills?: string[];

  @IsOptional()
  @IsArray()
  missingSkills?: string[];

  @IsOptional()
  @IsArray()
  projects?: string[];

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  customDoubt?: string;
}
