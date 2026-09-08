import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipsService } from '../memberships/memberships.service';
import { CreateOrganizationDto } from './dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private membershipsService: MembershipsService,
  ) {}

  async create(userId: string, dto: CreateOrganizationDto) {
    // Check if slug is taken
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Organization slug already taken');
    }

    // Create organization
    const organization = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return organization;
  }

  async findAll(userId: string) {
    const organizations = await this.prisma.organization.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            memberships: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add membership status for each organization
    const orgsWithMembership = await Promise.all(
      organizations.map(async (org) => {
        const isMember = await this.membershipsService.checkMembership(userId, org.id);
        const isCreator = org.createdById === userId;
        
        return {
          ...org,
          isMember,
          isCreator,
          memberCount: org._count.memberships,
        };
      }),
    );

    return orgsWithMembership;
  }

  async findOne(id: string, userId?: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            memberships: true,
          },
        },
      },
    });

    if (!organization) {
      return null;
    }

    // Add membership info if userId provided
    if (userId) {
      const isMember = await this.membershipsService.checkMembership(userId, id);
      const isCreator = organization.createdById === userId;

      return {
        ...organization,
        isMember,
        isCreator,
        memberCount: organization._count.memberships,
      };
    }

    return {
      ...organization,
      memberCount: organization._count.memberships,
    };
  }
}
