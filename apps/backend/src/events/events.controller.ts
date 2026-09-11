import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateEventDto) {
    return this.eventsService.create(req.user.id, dto);
  }

  @Get()
  async findAll(
    @Query('organizationId') organizationId?: string,
    @Query('status') status?: string,
  ) {
    return this.eventsService.findAll(organizationId, status);
  }

  @Get('organization/:organizationId')
  async findByOrganization(
    @Param('organizationId') organizationId: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.eventsService.findByOrganization(
      organizationId,
      upcoming === 'true',
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    return this.eventsService.delete(id, req.user.id);
  }

  @Post(':id/publish')
  async publish(@Request() req, @Param('id') id: string) {
    return this.eventsService.publish(id, req.user.id);
  }

  @Post(':id/cancel')
  async cancel(@Request() req, @Param('id') id: string) {
    return this.eventsService.cancel(id, req.user.id);
  }
}
