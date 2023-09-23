import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum EventType {
  Birth = 'birth',
  Memorial = 'memorial',
  Wedding = 'wedding',
  Other = 'other',
}

@Schema()
export class Event extends Document {
  @Prop({ required: true })
  description: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, enum: EventType, default: EventType.Other })
  type: EventType;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({ description: 1, type: 1 }, { unique: true }); // Unique compound index
