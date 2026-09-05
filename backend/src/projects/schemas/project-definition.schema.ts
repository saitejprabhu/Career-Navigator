import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ProjectDefinition extends Document {
  @Prop({ required: true, unique: true })
  projectId: string; // e.g. "html-p1"

  @Prop({ required: true })
  skillId: string; // e.g. "html"

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: [{ question: String, options: [String], correctIndex: Number }],
  })
  quiz: { question: string; options: string[]; correctIndex: number }[];
}

export const ProjectDefinitionSchema =
  SchemaFactory.createForClass(ProjectDefinition);
