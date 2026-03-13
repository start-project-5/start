import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * CreateBookingDto — data required to book a guide for a full day.
 *
 * Bookings are per day — the tourist picks a calendar date,
 * not a specific hour. The guide is booked for the entire day.
 */
export class CreateBookingDto {
  /** The tourist making the booking */
  @IsInt()
  @IsPositive()
  userId: number;

  /** The guide being booked */
  @IsInt()
  @IsPositive()
  guideId: number;

  /**
   * The date of the tour.
   * @IsDateString validates ISO 8601 format: "YYYY-MM-DD"
   * Example: "2024-08-20"
   */
  @IsDateString({}, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  /** Optional message from the tourist to the guide */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

/**
 * UpdateBookingDto — used to change the status of a booking.
 *
 * Example:
 *   Guide confirms:  PATCH /bookings/7  { "status": "confirmed" }
 *   Tourist cancels: PATCH /bookings/7  { "status": "cancelled" }
 */
