import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get(':skillId')
  getProjects(@Param('skillId') skillId: string) {
    return this.projectsService.getProjectsForSkill(skillId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':projectId/submit')
  submitProject(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() body: { githubUrl: string },
  ) {
    return this.projectsService.submitProject(
      req.user.userId,
      projectId,
      body.githubUrl,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':projectId/quiz')
  submitQuiz(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() body: { answers: number[] },
  ) {
    return this.projectsService.submitQuiz(
      req.user.userId,
      projectId,
      body.answers,
    );
  }
}
