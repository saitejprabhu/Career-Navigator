import { Controller, Get } from '@nestjs/common';
import { SkillsService } from './skills.service';

@Controller()
export class SkillsController {
  constructor(private skillsService: SkillsService) {}

  @Get('skills')
  getSkills() {
    return this.skillsService.getAllSkills();
  }

  @Get('roles')
  getRoles() {
    return this.skillsService.getAllRoles();
  }
}
