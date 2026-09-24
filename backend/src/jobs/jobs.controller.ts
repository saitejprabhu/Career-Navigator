import { Controller, Get, Query } from '@nestjs/common';

@Controller('jobs')
export class JobsController {
  @Get()
  async getJobs(@Query('role') role: string) {
    if (!role) return [];

    try {
      const response = await fetch(
        `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(role)}&limit=5`,
      );
      if (!response.ok) return [];

      const data = await response.json();
      return data.jobs || [];
    } catch {
      return [];
    }
  }
}
