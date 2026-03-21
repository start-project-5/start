import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateHotelDto } from './hotel.dto';

export class CreateHotelSwaggerDto extends CreateHotelDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Mehmonxona uchun rasm fayli (jpg, png, webp)',
    required: false,
  })
  declare file?: any;
}

// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { CreateHotelDto } from './hotel.dto';

// export class CreateHotelSwaggerDto extends CreateHotelDto {
//   @ApiPropertyOptional({ 
//     type: 'string', 
//     format: 'binary', 
//     description: 'Hotel rasmi' ,
//     required: false  // Odatda hotelni yangilaganda rasm yuborish majburiy emas
//   })
//   declare file?: any;
// }
