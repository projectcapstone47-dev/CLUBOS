import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

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
    // For now, return all organizations
    // Later we'll filter by membership
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return organizations;
  }

  async findOne(id: string) {
    return this.prisma.organization.findUnique({
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
      },
    });
  }
}
