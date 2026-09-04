import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Role extends Document {
  @Prop({ required: true, unique: true })
  roleId: string; // e.g. "frontend-dev"

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  requiredSkills: string[]; // array of skillIds
}

export const RoleSchema = SchemaFactory.createForClass(Role);
