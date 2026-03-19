import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateRestaurantDto } from './update-restaurant.dto';

export class UpdateRestaurantSwaggerDto extends UpdateRestaurantDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Yangi rasm (ixtiyoriy)',
  })
  declare file?: any;
}