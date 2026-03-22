import { PartialType } from '@nestjs/swagger';
import { CreateMenuCatalogDto } from './create-menu-catalog.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateMenuCatalogDto extends PartialType(CreateMenuCatalogDto) {
  @ApiPropertyOptional({ example: 'Yangi taom nomi' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  name?: string;
}