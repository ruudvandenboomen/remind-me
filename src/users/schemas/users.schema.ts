// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Event } from '../../events/schemas/event.schema';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Event' }] })
  events: Event[]; // Define the one-to-many relationship
}

export const UserSchema = SchemaFactory.createForClass(User);
