import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';

const BADGE_RULES = [
  { days: 3, id: 'getting-started', name: 'Getting Started' },
  { days: 7, id: 'consistent-learner', name: 'Consistent Learner' },
  { days: 14, id: 'dedicated-learner', name: 'Dedicated Learner' },
  { days: 30, id: 'unstoppable', name: 'Unstoppable' },
];

@Injectable()
export class StreakService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async checkStreak(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const today = new Date().toDateString();
    const last = user.streak.lastActiveDate;

    if (last === today) {
      // already counted today, just return current state
      return { streak: user.streak, badges: user.badges };
    }

    const daysDiff = last
      ? Math.floor(
          (new Date(today).getTime() - new Date(last).getTime()) / 86400000,
        )
      : 0;

    let { count, freezesAvailable } = user.streak;

    if (daysDiff === 1) {
      count += 1;
    } else if (daysDiff === 2 && freezesAvailable > 0) {
      count += 1;
      freezesAvailable -= 1;
    } else if (daysDiff > 1 || !last) {
      count = 1;
    }

    if (count % 3 === 0 && freezesAvailable < 2) {
      freezesAvailable += 1;
    }

    user.streak = { count, lastActiveDate: today, freezesAvailable };
    user.markModified('streak');

    // check for new badges
    const newBadges = BADGE_RULES.filter(
      (b) => count >= b.days && !user.badges.includes(b.id),
    ).map((b) => b.id);

    if (newBadges.length > 0) {
      user.badges = [...user.badges, ...newBadges];
      user.markModified('badges');
    }

    await user.save();

    return { streak: user.streak, badges: user.badges, newBadges };
  }

  async getStreak(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    return { streak: user.streak, badges: user.badges };
  }
}
