import { IsString, IsDate, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // You can adjust this import based on your setup
import { EventType } from '../schemas/event.schema'; // Make sure to import your EventType enum

export class CreateEventDto {
  @ApiProperty({ description: 'Description of the event' })
  @IsString()
  readonly description: string;

  @ApiProperty({ description: 'Date of the event' })
  @IsDate()
  readonly date: Date;

  @ApiProperty({
    description: 'Type of the event',
    enum: EventType,
    default: EventType.Other,
  })
  @IsEnum(EventType)
  readonly type: EventType;
}
