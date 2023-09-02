// users.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  NotFoundException,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/users.schema';
import { Event } from '../events/schemas/event.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    const user = await this.usersService.createUser(createUserDto);
    return user;
  }

  @Get(':username')
  async getUserByUsername(
    @Param('username') username: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get(':id/events')
  async getUserEvents(@Param('id') userId: string): Promise<Event[]> {
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new HttpException('Invalid user id', HttpStatus.BAD_REQUEST);
    }
    const events = await this.usersService.getUserEvents(userId);
    return events;
  }
}
