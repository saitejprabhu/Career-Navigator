import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @UseGuards(JwtAuthGuard)
  @Post('mark-learned')
  async markLearned(@Request() req, @Body() body: { skillId: string }) {
    return this.progressService.markAsLearned(req.user.userId, body.skillId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProgress(@Request() req) {
    return this.progressService.getProgress(req.user.userId);
  }
}
