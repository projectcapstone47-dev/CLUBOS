import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto) {
    // Check if organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if user is a member of the organization
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: dto.organizationId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member of this organization to create events');
    }

    // Validate dates
    if (dto.endDate && new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException('End date cannot be before start date');
    }

    // Create activity and event
    const activity = await this.prisma.activity.create({
      data: {
        type: 'event',
        title: dto.title,
        description: dto.description,
        organizationId: dto.organizationId,
        createdById: userId,
        status: 'draft',
        event: {
          create: {
            startDate: new Date(dto.startDate),
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            venue: dto.venue,
            eventType: dto.eventType || 'general',
            maxAttendees: dto.maxAttendees,
            isPublic: dto.isPublic !== undefined ? dto.isPublic : true,
          },
        },
      },
      include: {
        event: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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

    return this.formatEventResponse(activity);
  }

  async findAll(organizationId?: string, status?: string) {
    const where: any = {
      type: 'event',
    };

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (status) {
      where.status = status;
    }

    const activities = await this.prisma.activity.findMany({
      where,
      include: {
        event: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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

    return activities.map(activity => this.formatEventResponse(activity));
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findFirst({
      where: {
        id,
        type: 'event',
      },
      include: {
        event: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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

    if (!activity) {
      throw new NotFoundException('Event not found');
    }

    return this.formatEventResponse(activity);
  }

  async findByOrganization(organizationId: string, upcoming: boolean = false) {
    const where: any = {
      type: 'event',
      organizationId,
    };

    if (upcoming) {
      where.event = {
        startDate: {
          gte: new Date(),
        },
      };
      where.status = {
        in: ['draft', 'published'],
      };
    }

    const activities = await this.prisma.activity.findMany({
      where,
      include: {
        event: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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
        event: {
          startDate: upcoming ? 'asc' : 'desc',
        },
      },
    });

    return activities.map(activity => this.formatEventResponse(activity));
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    // Find the event
    const activity = await this.prisma.activity.findFirst({
      where: {
        id,
        type: 'event',
      },
      include: {
        event: true,
      },
    });

    if (!activity) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is the creator or a member with permission
    if (activity.createdById !== userId) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: activity.organizationId,
          },
        },
      });

      if (!membership || membership.role === 'member') {
        throw new ForbiddenException('You do not have permission to update this event');
      }
    }

    // Validate dates if provided
    const newStartDate = dto.startDate ? new Date(dto.startDate) : activity.event.startDate;
    const newEndDate = dto.endDate ? new Date(dto.endDate) : activity.event.endDate;

    if (newEndDate && newEndDate < newStartDate) {
      throw new BadRequestException('End date cannot be before start date');
    }

    // Update activity and event
    const updateData: any = {};
    const eventUpdateData: any = {};

    if (dto.title) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status) updateData.status = dto.status;

    if (dto.startDate) eventUpdateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) eventUpdateData.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.venue !== undefined) eventUpdateData.venue = dto.venue;
    if (dto.eventType) eventUpdateData.eventType = dto.eventType;
    if (dto.maxAttendees !== undefined) eventUpdateData.maxAttendees = dto.maxAttendees;
    if (dto.isPublic !== undefined) eventUpdateData.isPublic = dto.isPublic;

    const updatedActivity = await this.prisma.activity.update({
      where: { id },
      data: {
        ...updateData,
        event: {
          update: eventUpdateData,
        },
      },
      include: {
        event: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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

    return this.formatEventResponse(updatedActivity);
  }

  async delete(id: string, userId: string) {
    // Find the event
    const activity = await this.prisma.activity.findFirst({
      where: {
        id,
        type: 'event',
      },
    });

    if (!activity) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is the creator or has admin role
    if (activity.createdById !== userId) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: activity.organizationId,
          },
        },
      });

      if (!membership || membership.role === 'member') {
        throw new ForbiddenException('You do not have permission to delete this event');
      }
    }

    // Delete the activity (cascade will delete event)
    await this.prisma.activity.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  async publish(id: string, userId: string) {
    return this.update(id, userId, { status: 'published' });
  }

  async cancel(id: string, userId: string) {
    return this.update(id, userId, { status: 'cancelled' });
  }

  private formatEventResponse(activity: any) {
    if (!activity.event) {
      return activity;
    }

    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      status: activity.status,
      startDate: activity.event.startDate,
      endDate: activity.event.endDate,
      venue: activity.event.venue,
      eventType: activity.event.eventType,
      maxAttendees: activity.event.maxAttendees,
      isPublic: activity.event.isPublic,
      organization: activity.organization,
      createdBy: activity.createdBy,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    };
  }
}
