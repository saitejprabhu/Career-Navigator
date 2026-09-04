import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ProgressService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async markAsLearned(userId: string, skillId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');

    user.skillStatus[skillId] = { status: 'claimed', lastUpdated: new Date() };
    user.markModified('skillStatus'); // needed since skillStatus is a Mixed/Object type
    await user.save();

    return user.skillStatus;
  }

  async getProgress(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');
    return user.skillStatus;
  }
}
