import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Object, default: {} })
  profile: {
    skills: string[];
    education: string[];
    certifications: string[];
    projects: string[];
    experience: string[];
    interests: string[];
  };

  @Prop({ type: Object, default: {} })
  skillStatus: Record<string, { status: string; lastUpdated: Date }>;

  @Prop({ type: Object, default: {} })
  projectSubmissions: Record<
    string,
    { githubUrl: string; status: string; quizPassed: boolean }
  >;

  @Prop({
    type: Object,
    default: { count: 0, lastActiveDate: null, freezesAvailable: 0 },
  })
  streak: {
    count: number;
    lastActiveDate: string | null;
    freezesAvailable: number;
  };

  @Prop({ type: [String], default: [] })
  badges: string[];

  @Prop({ type: [String], default: [] })
  enrolledRoles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
