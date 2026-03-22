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