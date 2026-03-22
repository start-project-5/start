import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateRestaurantMenuDto } from './update-menu-item.dto';

export class UpdateRestaurantMenuSwaggerDto extends UpdateRestaurantMenuDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Yangi rasm (ixtiyoriy)',
  })
  declare file?: any;
}