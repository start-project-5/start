import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean, IsEnum, IsNotEmpty, IsNumber,
  IsOptional, IsString, Max, Min,
} from 'class-validator';
import { MenuCategory } from 'src/common/enum/menu-category';

export class CreateMenuCatalogDto {
  @ApiProperty({ example: 'Osh', description: 'Taom nomi' })
  @IsString()
  @IsNotEmpty({ message: "Taom nomi bo'lishi shart" })
  name: string;

  @ApiPropertyOptional({ example: 'Milliy taom...' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  description?: string;

  @ApiProperty({ example: 35000, description: "Narxi (so'mda)" })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 25000, description: 'Chegirmali narx' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discountPrice?: number;

  @ApiProperty({ enum: MenuCategory, default: MenuCategory.MAIN_COURSE })
  @IsEnum(MenuCategory)
  category: MenuCategory;

  @ApiPropertyOptional({ example: 20, description: 'Tayyorlash vaqti (daqiqa)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  preparationTime?: number;

  @ApiPropertyOptional({ example: 500, description: 'Kaloriya' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  calories?: number;

  @ApiPropertyOptional({ example: ['go\'sht', 'piyoz'] })
  @IsOptional()
  ingredients?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  isVegetarian?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  isSpicy?: boolean;

  @IsOptional()
  file?: any;
}