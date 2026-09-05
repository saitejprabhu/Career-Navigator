import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
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
}

export const UserSchema = SchemaFactory.createForClass(User);
