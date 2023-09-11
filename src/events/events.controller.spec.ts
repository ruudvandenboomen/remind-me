import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { BadRequestException } from '@nestjs/common';
import { Event } from './schemas/event.schema';
import { getModelToken } from '@nestjs/mongoose';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        EventsService,
        {
          provide: getModelToken(Event.name),
          useValue: Event,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should upload a VCF file and return birthday data', async () => {
    const file = { path: '/path/to/your/file.vcf' }; // Replace with a valid file path

    // Mock the saveBirthdayData method in your service
    jest.spyOn(service, 'saveBirthdayData').mockReturnValue(Promise.resolve());

    const result = await controller.uploadVcfFile(file);

    // Ensure the controller returns the expected birthday data
    expect(result).toEqual({
      message: 'Events created successfully',
    });
  });

  it('should handle a missing VCF file', async () => {
    const file = null; // Simulate a missing file

    // Mock the saveBirthdayData method in your service (not needed in this case)
    // jest.spyOn(service, 'saveBirthdayData');

    // Ensure the controller throws a BadRequestException with the specified message
    await expect(controller.uploadVcfFile(file)).rejects.toThrowError(
      BadRequestException,
    );
    await expect(controller.uploadVcfFile(file)).rejects.toMatchObject({
      message: 'No VCF file uploaded',
    });
  });
});
