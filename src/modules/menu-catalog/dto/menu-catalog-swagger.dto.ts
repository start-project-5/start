import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateMenuCatalogDto } from './create-menu-catalog.dto';

export class CreateMenuCatalogSwaggerDto extends CreateMenuCatalogDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Taom rasmi (jpg, png, webp)',
  })
  declare file?: any;
}