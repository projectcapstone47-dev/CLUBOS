import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('memberships')
@UseGuards(JwtAuthGuard)
export class MembershipsController {
  constructor(private membershipsService: MembershipsService) {}

  @Post('organizations/:organizationId/join')
  async join(@Request() req, @Param('organizationId') organizationId: string) {
    return this.membershipsService.joinOrganization(req.user.id, organizationId);
  }

  @Delete('organizations/:organizationId/leave')
  async leave(@Request() req, @Param('organizationId') organizationId: string) {
    return this.membershipsService.leaveOrganization(req.user.id, organizationId);
  }

  @Get('organizations/:organizationId/members')
  async getMembers(@Param('organizationId') organizationId: string) {
    return this.membershipsService.getOrganizationMembers(organizationId);
  }

  @Get('my-memberships')
  async getMyMemberships(@Request() req) {
    return this.membershipsService.getUserMemberships(req.user.id);
  }
}
