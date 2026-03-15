import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookingStatus } from 'src/common/enum/booking-status.enum';

export class UpdateBookingStatusDto {
  @ApiProperty({ 
    enum: BookingStatus, 
    example: BookingStatus.CONFIRMED,
    description: 'Bron holatini yangilash' 
  })
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus;
}

// import { IsIn } from 'class-validator';
// import { BookingStatus } from 'src/common/enum/booking-status.enum';

// export class UpdateBookingDto {
//   /**
//    * @IsIn validates the value is exactly one of the allowed strings.
//    * This replaces the need for an enum in simple student projects.
//    */

//   @IsIn(Object.values(BookingStatus))
//   status: BookingStatus;
// }
