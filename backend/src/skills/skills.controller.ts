import { Controller, Get, Put, Body, Request, UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class SkillsController {
  constructor(
    private skillsService: SkillsService,
    private usersService: UsersService,
  ) {}

  @Get('skills')
  getSkills() {
    return this.skillsService.getAllSkills();
  }

  @Get('roles')
  getRoles() {
    return this.skillsService.getAllRoles();
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/roles')
  async updateEnrolledRoles(
    @Request() req,
    @Body() body: { enrolledRoles: string[] },
  ) {
    return this.usersService.setEnrolledRoles(
      req.user.userId,
      body.enrolledRoles,
    );
  }
}
