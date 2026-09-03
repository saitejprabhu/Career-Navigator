import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(email: string, hashedPassword: string) {
    const user = new this.userModel({
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

  async updateProfile(id: string, profile: any) {
    return this.userModel.findByIdAndUpdate(id, { profile }, { new: true });
  }
}
