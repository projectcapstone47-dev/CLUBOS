import { IsString, IsNotEmpty, IsOptional, IsDateString, IsBoolean, IsEnum, IsInt, Min } from 'class-validator';

export enum EventType {
  GENERAL = 'general',
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  COMPETITION = 'competition',
  SOCIAL = 'social',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsEnum(EventType)
  @IsOptional()
  eventType?: EventType;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxAttendees?: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsEnum(EventType)
  @IsOptional()
  eventType?: EventType;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxAttendees?: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}
