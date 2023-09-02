// create-user.dto.ts
import { IsString, IsEmail, IsArray } from 'class-validator';
import { Event } from 'src/events/schemas/event.schema';

export class CreateUserDto {
  @IsString()
  readonly username: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsArray()
  readonly events: Event[];
}
