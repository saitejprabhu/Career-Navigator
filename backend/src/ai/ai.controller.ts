import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';
import { SkillGapSummaryDto } from './dto/skill-gap-summary.dto';
import { CareerDiscoveryDto } from './dto/career-discovery.dto';
import { ExtractSkillsDto } from './dto/extract-skills.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('skill-gap-summary')
  async getSkillGapSummary(@Body() dto: SkillGapSummaryDto) {
    return this.aiService.generateSkillGapSummary(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('career-discovery')
  async discoverCareers(@Body() dto: CareerDiscoveryDto) {
    return this.aiService.generateCareerDiscoveryResponse(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('extract-resume-skills')
  async extractSkills(@Body() dto: ExtractSkillsDto) {
    return this.aiService.extractSkillsFromResumeText(dto);
  }
}
