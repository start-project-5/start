import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateRestaurantMenuDto } from './create-menu-item.dto';

export class UpdateRestaurantMenuDto extends PartialType(
  CreateRestaurantMenuDto,
) {
  @ApiPropertyOptional({ description: "Katalog ID (o'zgartirish ixtiyoriy)" })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  catalogId?: string;

  @ApiPropertyOptional({ description: "Restoran ID (o'zgartirish ixtiyoriy)" })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  restaurantId?: string;
}
