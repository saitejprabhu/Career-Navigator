import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { Skill, SkillSchema } from './schemas/skill.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Skill.name, schema: SkillSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    UsersModule,
  ],
  controllers: [SkillsController],
  providers: [SkillsService],
})
export class SkillsModule {}
