import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean, IsEnum, IsNotEmpty, IsNumber,
  IsOptional, IsUUID, Min,
} from 'class-validator';
import { MenuItemStatus } from 'src/common/enum/menuitem-status';

export class CreateRestaurantMenuDto {
  @ApiProperty({ description: 'Katalogdagi taom ID si' })
  @IsUUID()
  @IsNotEmpty()
  catalogId: string;

  @ApiProperty({ description: 'Restoran ID si' })
  @IsUUID()
  @IsNotEmpty()
  restaurantId: string;

  @ApiPropertyOptional({ example: 40000, description: "Maxsus narx (null = katalog narxi)" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  customPrice?: number;

  @ApiPropertyOptional({ example: 'Maxsus Osh', description: 'Maxsus nom (null = katalog nomi)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  customName?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  isAvailable?: boolean;

  @ApiPropertyOptional({ enum: MenuItemStatus, default: MenuItemStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(MenuItemStatus)
  status?: MenuItemStatus;

  @IsOptional()
  file?: any;
}