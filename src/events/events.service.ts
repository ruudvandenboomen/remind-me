// events.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventType } from './schemas/event.schema';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventDto } from './dto/create-event.dto';
import * as fs from 'fs';
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
    const today = new Date();

    return this.eventModel
      .aggregate([
        {
          $project: {
            description: 1,
            date: 1,
            nextBirthday: {
              $dateFromParts: {
                year: { $year: today },
                month: { $month: '$date' },
                day: { $dayOfMonth: '$date' },
              },
            },
          },
        },
        {
          $project: {
            description: 1,
            date: 1,
            daysUntilBirthday: {
              $ceil: {
                $divide: [
                  { $subtract: ['$nextBirthday', today] },
                  1000 * 60 * 60 * 24, // Convert milliseconds to days
                ],
              },
            },
          },
        },
        {
          $match: {
            daysUntilBirthday: { $gt: 0 },
          },
        },
        {
          $sort: {
            daysUntilBirthday: 1,
          },
        },
      ])
      .exec();
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

  async saveBirthdayData(filePath: string): Promise<void> {
    const fileContents = fs.readFileSync(filePath, 'utf-8');

    const contactData = [];

    // Regular expression to match lines containing name and birthday data
    const contactRegex = /BEGIN:VCARD([\s\S]*?)END:VCARD/g;

    let match;
    while ((match = contactRegex.exec(fileContents))) {
      const vCardData = match[1];
      const nameMatch = vCardData.match(/FN:(.*?)\r?\n/);
      const birthdayMatch = vCardData.match(/BDAY:(\d{4}-\d{2}-\d{2})/);

      if (nameMatch && birthdayMatch) {
        const name = nameMatch[1];
        const birthday = birthdayMatch[1];

        const event = new this.eventModel();
        event.date = new Date(birthday);
        event.description = name;
        event.type = EventType.Birth;
        contactData.push(event);
      }
    }

    await this.eventModel
      .insertMany(contactData, {
        ordered: false,
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
