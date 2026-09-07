import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StreakService } from './streak.service';

@Controller('streak')
export class StreakController {
  constructor(private streakService: StreakService) {}

  @UseGuards(JwtAuthGuard)
  @Post('check')
  checkStreak(@Request() req) {
    return this.streakService.checkStreak(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getStreak(@Request() req) {
    return this.streakService.getStreak(req.user.userId);
  }
}
