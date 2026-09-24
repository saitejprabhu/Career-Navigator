import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SkillsModule } from './skills/skills.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProgressModule } from './progress/progress.module';
import { ProjectsModule } from './projects/projects.module';
import { StreakModule } from './streak/streak.module';
import { JobsModule } from './jobs/jobs.module';
import { AiModule } from './ai/ai.module';
import { SalaryModule } from './salary/salary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    UsersModule,
    AuthModule,
    SkillsModule,
    ProgressModule,
    ProjectsModule,
    StreakModule,
    JobsModule,
    AiModule,
    SalaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
