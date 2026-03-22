import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateHotelDto } from './update-hotel.dto';

export class UpdateHotelSwaggerDto extends UpdateHotelDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Yangi rasm (ixtiyoriy)',
    required: false,
  })
  declare file?: any;
}