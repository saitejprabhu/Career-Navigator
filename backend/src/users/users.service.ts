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
    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
    }
    if (data.profile) {
      updateData.profile = data.profile;
      if (data.name) updateData.name = data.name;
    } else {
      const { name, ...profileFields } = data;
      if (name) updateData.name = name;
      updateData.profile = profileFields;
    }
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async setEnrolledRoles(userId: string, roleIds: string[]) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { enrolledRoles: roleIds },
      { new: true },
    );
  }
}
