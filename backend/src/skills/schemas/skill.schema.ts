import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Skill extends Document {
  @Prop({ required: true, unique: true })
  skillId: string; // e.g. "html"

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  prerequisites: string[]; // array of skillIds
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
