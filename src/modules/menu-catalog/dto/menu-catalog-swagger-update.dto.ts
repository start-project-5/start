import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateMenuCatalogDto } from './update-menu-catalog.dto';

export class UpdateMenuCatalogSwaggerDto extends UpdateMenuCatalogDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Yangi rasm (ixtiyoriy)',
  })
  declare file?: any;
}