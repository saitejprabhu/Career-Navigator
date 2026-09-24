import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SalaryService } from './salary.service';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @UseGuards(JwtAuthGuard)
  @Get('insights')
  async getSalaryInsights(
    @Query('role') role: string,
    @Query('country') country?: string,
  ) {
    return this.salaryService.getSalaryInsights(role, country || 'in');
  }
}
