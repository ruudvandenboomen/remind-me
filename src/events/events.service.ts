// events.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './schemas/event.schema';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}

  async create(eventData: CreateEventDto): Promise<Event> {
    const createdEvent = new this.eventModel(eventData);
    return createdEvent.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  async findOne(id: string): Promise<Event | null> {
    return this.eventModel.findById(id).exec();
  }

  async update(id: string, eventData: UpdateEventDto): Promise<Event | null> {
    return this.eventModel
      .findByIdAndUpdate(id, eventData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Event | null> {
    return this.eventModel.findByIdAndRemove(id).exec();
  }
}
