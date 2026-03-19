import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceRange } from 'src/common/enum/restaurant_price.enum';
import { PaginationDto } from 'src/utils/pagination';

export class FilterRestaurantDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Nomi yoki tavsifi boʻyicha qidirish' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PriceRange })
  @IsOptional()
  @IsEnum(PriceRange)
  priceRange?: PriceRange;

  @ApiPropertyOptional({ description: 'Minimal reyting (0-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number;

  @ApiPropertyOptional({ description: 'Shahar yoki manzil boʻyicha filtr' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Buyurtma olish olmasligiga qarab qidiruv' })
  @IsOptional()
  isBookingAvailable?: boolean
}