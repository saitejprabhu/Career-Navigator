import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectDefinition } from './schemas/project-definition.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(ProjectDefinition.name)
    private projectModel: Model<ProjectDefinition>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getProjectsForSkill(skillId: string) {
    return this.projectModel.find({ skillId });
  }

  async submitProject(userId: string, projectId: string, githubUrl: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    // duplicate repo check across this user's submissions
    const alreadyUsed = Object.values(user.projectSubmissions || {}).some(
      (p: any) => p.githubUrl === githubUrl,
    );
    if (alreadyUsed)
      throw new BadRequestException(
        'This repository was already submitted for another project.',
      );

    user.projectSubmissions[projectId] = {
      githubUrl,
      status: 'Submitted',
      quizPassed: false,
    };
    user.markModified('projectSubmissions');
    await user.save();

    return user.projectSubmissions;
  }

  async submitQuiz(userId: string, projectId: string, answers: number[]) {
    const project = await this.projectModel.findOne({ projectId });
    if (!project) throw new BadRequestException('Project not found');

    const correctCount = project.quiz.filter(
      (q, i) => q.correctIndex === answers[i],
    ).length;
    const passed = correctCount === project.quiz.length;

    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    user.projectSubmissions[projectId] = {
      ...user.projectSubmissions[projectId],
      quizPassed: passed,
      status: passed ? 'Completed' : 'Submitted',
    };
    user.markModified('projectSubmissions');

    // check if both projects for this skill are completed -> upgrade skill status
    if (passed) {
      const skillId = project.skillId;
      const skillProjects = await this.projectModel.find({ skillId });
      const completedCount = skillProjects.filter(
        (p) => user.projectSubmissions[p.projectId]?.status === 'Completed',
      ).length;

      const newStatus = completedCount >= 2 ? 'mastered' : 'practiced';
      user.skillStatus[skillId] = {
        status: newStatus,
        lastUpdated: new Date(),
      };
      user.markModified('skillStatus');
    }

    await user.save();
    return { passed, correctCount, total: project.quiz.length };
  }
}
