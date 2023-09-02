import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<Event>;

export enum EventType {
  Birth = 'birth',
  Memorial = 'memorial',
  Wedding = 'wedding',
  Other = 'other',
}

@Schema()
export class Event {
  @Prop({ required: true })
  description: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, enum: EventType, default: EventType.Other })
  type: EventType;
}

export const EventSchema = SchemaFactory.createForClass(Event);
