import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill } from './schemas/skill.schema';
import { Role } from './schemas/role.schema';

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(Skill.name) private skillModel: Model<Skill>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async getAllSkills() {
    return this.skillModel.find();
  }

  async getAllRoles() {
    return this.roleModel.find();
  }
}
