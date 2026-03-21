import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceRange } from 'src/common/enum/restaurant_price.enum';
import { PaginationDto } from 'src/utils/pagination';

export class FilterHotelDto extends PaginationDto {
  @ApiPropertyOptional({ description: "Nomi bo'yicha qidirish" })
  @IsOptional()
  @IsString()
  search?: string;
  
  @ApiPropertyOptional({ description: 'Minimal reyting (0-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stars?: number;

  @ApiPropertyOptional({ description: 'Shahar yoki manzil boʻyicha filtr' })
  @IsOptional()
  @IsString()
  address?: string;
  
  @ApiPropertyOptional({ description: 'Minimal reyting (0-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ description: 'Buyurtma olish olmasligiga qarab qidiruv' })
  @IsOptional()
  isAvailable?: boolean
}