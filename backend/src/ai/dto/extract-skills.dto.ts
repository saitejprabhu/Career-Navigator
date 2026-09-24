import { IsString, IsArray, IsOptional } from 'class-validator';

export class ExtractSkillsDto {
  @IsOptional()
  @IsString()
  resumeText?: string;

  @IsOptional()
  @IsArray()
  availableSkills?: any[];
}
