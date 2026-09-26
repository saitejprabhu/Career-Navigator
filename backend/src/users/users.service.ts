import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(name: string, email: string, hashedPassword: string) {
    const user = new this.userModel({
      name,
      email,
      password: hashedPassword,
      profile: {},
    });
    return user.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async updateProfile(id: string, data: any) {
    const user = await this.userModel.findById(id);
    if (!user) return null;

    if (data.name) {
      user.name = data.name;
    }

    const newProfile = data.profile !== undefined ? data.profile : data;
    user.profile = {
      ...(user.profile || {}),
      ...newProfile,
    };
    user.markModified('profile');

    return user.save();
  }

  async setEnrolledRoles(userId: string, roleIds: string[]) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { enrolledRoles: roleIds },
      { new: true },
    );
  }
}
