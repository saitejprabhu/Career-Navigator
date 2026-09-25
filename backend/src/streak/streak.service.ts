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

const MAX_FREEZES = 3;

@Injectable()
export class StreakService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private ensureValidStreakFields(user: User) {
    if (!user.streak) {
      user.streak = { count: 0, lastActiveDate: null, freezesAvailable: 0 };
    }
    if (!user.badges) {
      user.badges = [];
    }

    user.streak.count = Number(user.streak.count) || 0;
    user.streak.freezesAvailable = Number(user.streak.freezesAvailable) || 0;

    if (typeof user.streak.lastActiveDate !== 'string') {
      user.streak.lastActiveDate = null;
    }
  }

  async checkStreak(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    this.ensureValidStreakFields(user);

    const today = new Date().toDateString();
    const last = user.streak.lastActiveDate;

    if (last === today) {
      return { streak: user.streak, badges: user.badges };
    }

    let { count, freezesAvailable } = user.streak;

    if (!last) {
      count = 1;
    } else {
      const todayTime = new Date(today).getTime();
      const lastTime = new Date(last).getTime();
      const daysDiff = Math.round((todayTime - lastTime) / 86400000);

      if (daysDiff === 1) {
        count += 1;
      } else if (daysDiff > 1) {
        const missedDays = daysDiff - 1;
        if (freezesAvailable >= missedDays) {
          freezesAvailable -= missedDays;
          count += 1;
        } else {
          freezesAvailable = 0;
          count = 1;
        }
      }
    }

    if (count > 0 && count % 3 === 0 && freezesAvailable < MAX_FREEZES) {
      freezesAvailable += 1;
    }

    user.streak = { count, lastActiveDate: today, freezesAvailable };
    user.markModified('streak');

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

    this.ensureValidStreakFields(user);

    const today = new Date().toDateString();
    const last = user.streak.lastActiveDate;

    if (!last || last === today) {
      return { streak: user.streak, badges: user.badges };
    }

    const todayTime = new Date(today).getTime();
    const lastTime = new Date(last).getTime();
    const daysDiff = Math.round((todayTime - lastTime) / 86400000);

    let effectiveCount = user.streak.count;
    let effectiveFreezes = user.streak.freezesAvailable;

    if (daysDiff > 1) {
      const missedDays = daysDiff - 1;
      if (effectiveFreezes >= missedDays) {
        effectiveFreezes -= missedDays;
      } else {
        effectiveCount = 0;
        effectiveFreezes = 0;
      }
    }

    return {
      streak: {
        count: effectiveCount,
        lastActiveDate: last,
        freezesAvailable: effectiveFreezes,
      },
      badges: user.badges,
    };
  }
}
