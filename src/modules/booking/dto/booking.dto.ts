import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ 
    example: '2026-06-15', 
    description: 'Bron qilinayotgan sana (YYYY-MM-DD)' 
  })
  @IsDateString({}, { message: 'Sana YYYY-MM-DD formatida boʻlishi kerak' })
  @IsNotEmpty()
  date: string;

  @ApiProperty({ 
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    description: 'Gidning UUID identifikatori' 
  })
  @IsUUID('4', { message: 'guideId notoʻgʻri UUID formatida' })
  @IsNotEmpty()
  guideId: string;

  @ApiProperty({ 
    example: 150000.00, 
    description: 'Kelishilgan umumiy narx' 
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalPrice: number;

  @ApiPropertyOptional({ 
    example: 'Bizga tarixiy obidalar haqida koʻproq soʻzlab bering.', 
    description: 'Turistning qoʻshimcha eslatmalari',
    maxLength: 1000 
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
  
  // Eslatma: userId odatda Controller-da Req.user-dan olinadi, 
  // shuning uchun DTO-ga userId qo'shish shart emas (Xavfsizlik uchun).
}

// import {
//   IsDateString,
//   IsIn,
//   IsInt,
//   IsOptional,
//   IsPositive,
//   IsString,
//   MaxLength,
// } from 'class-validator';

// /**
//  * CreateBookingDto — data required to book a guide for a full day.
//  *
//  * Bookings are per day — the tourist picks a calendar date,
//  * not a specific hour. The guide is booked for the entire day.
//  */
// export class CreateBookingDto {
//   /** The tourist making the booking */
//   @IsInt()
//   @IsPositive()
//   userId: number;

//   /** The guide being booked */
//   @IsInt()
//   @IsPositive()
//   guideId: number;

//   /**
//    * The date of the tour.
//    * @IsDateString validates ISO 8601 format: "YYYY-MM-DD"
//    * Example: "2024-08-20"
//    */
//   @IsDateString({}, { message: 'date must be in YYYY-MM-DD format' })
//   date: string;

//   /** Optional message from the tourist to the guide */
//   @IsOptional()
//   @IsString()
//   @MaxLength(500)
//   note?: string;
// }

// /**
//  * UpdateBookingDto — used to change the status of a booking.
//  *
//  * Example:
//  *   Guide confirms:  PATCH /bookings/7  { "status": "confirmed" }
//  *   Tourist cancels: PATCH /bookings/7  { "status": "cancelled" }
//  */
