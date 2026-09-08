import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  async joinOrganization(userId: string, organizationId: string) {
    // Check if organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if already a member
    const existing = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Already a member of this organization');
    }

    // Create membership
    const membership = await this.prisma.membership.create({
      data: {
        userId,
        organizationId,
        role: 'member',
        status: 'active',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return membership;
  }

  async leaveOrganization(userId: string, organizationId: string) {
    // Check if membership exists
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Not a member of this organization');
    }

    // Check if user is the creator
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (organization.createdById === userId) {
      throw new BadRequestException('Organization creator cannot leave');
    }

    // Delete membership
    await this.prisma.membership.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return { message: 'Left organization successfully' };
  }

  async getOrganizationMembers(organizationId: string) {
    const members = await this.prisma.membership.findMany({
      where: {
        organizationId,
        status: 'active',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return members;
  }

  async getUserMemberships(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: {
        userId,
        status: 'active',
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return memberships;
  }

  async checkMembership(userId: string, organizationId: string): Promise<boolean> {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return !!membership && membership.status === 'active';
  }
}
