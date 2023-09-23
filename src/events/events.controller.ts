import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.gaurd';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';

export interface IGetUserAuthInfoRequest extends Request {
  user: {
    userId: string;
  }; 
}
export const vcfFileFilter = (req: any, file: any, callback: any) => {
  if (extname(file.originalname) !== '.vcf') {
    return callback(new Error('Only VCF files are allowed'));
  }
  callback(null, true);
};

export const vcfStorage = diskStorage({
  destination: './uploads/vcf',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, uniqueSuffix + extname(file.originalname));
  },
});
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventService: EventsService,
    private readonly userService: UsersService,
  ) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: IGetUserAuthInfoRequest) {
    const events = await this.userService.getEventsForUser(req.user.userId);
    return this.eventService.findAll(events);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('vcfFile', {
      storage: vcfStorage,
      fileFilter: vcfFileFilter,
    }),
  )
  async uploadVcfFile(
    @Req() req: IGetUserAuthInfoRequest,
    @UploadedFile() file: any,
  ) {
    // You can process the uploaded VCF file here
    if (!file) {
      throw new BadRequestException('No VCF file uploaded');
    }

    // Extract birthday data from the uploaded VCF file
    const eventData = await this.eventService.getBirthdayData(file.path);
    this.userService.createEvents(req.user.userId, eventData);
    return {
      message: 'Events created successfully',
    };
  }
}
