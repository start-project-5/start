import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class CreateEventDto {
  @IsString() @Length(2, 200)   title: string;
  @IsString() @Length(10, 3000) description: string;
  @IsString() @Length(5, 255)   location: string;

  /** ISO 8601 datetime, e.g. "2024-09-01T18:00:00Z" */
  @IsDateString({}, { message: 'date must be a valid ISO datetime string' })
  date: string;

  @IsString() @Length(2, 150)   organizer: string;
}

