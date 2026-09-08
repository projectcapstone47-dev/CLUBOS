import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.organizationsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }
}
