import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateRestaurantMenuDto } from './create-menu-item.dto';

export class CreateRestaurantMenuSwaggerDto extends CreateRestaurantMenuDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Maxsus rasm (null = katalog rasmi ishlatiladi)',
  })
  declare file?: any;
}