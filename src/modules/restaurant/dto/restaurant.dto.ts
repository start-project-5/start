import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  IsObject,
} from 'class-validator';
import { string } from 'joi';
import { PriceRange } from 'src/common/enum/restaurant_price.enum';

export class CreateRestaurantDto {
  @ApiProperty({
    example: 'Rayhon Milliy Taomlari',
    description: 'Restoran nomi',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Eng mazali milliy taomlar va shashliklar...',
    description: 'Restoran tavsifi',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ enum: PriceRange, default: PriceRange.MODERATE })
  @IsEnum(PriceRange)
  priceRange: PriceRange;

  @ApiProperty({
    example: "Toshkent sh., Lutfiy ko'chasi, 14-uy",
    description: 'Manzil',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: 41.2858, description: 'Latitude' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return String(parseFloat(value));
  })
  @IsLatitude()
  latitude?: string;

  @ApiPropertyOptional({ example: 69.2036, description: 'Longitude' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return String(parseFloat(value));
  })
  @IsLongitude()
  longitude?: string;

  @ApiPropertyOptional({ example: 4.5, minimum: 0, maximum: 5, default: 0.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  @ApiPropertyOptional({ example: { mon: '09:00-22:00' } })
  @IsOptional() // <--- BU JUDA MUHIM! Commentdan chiqaring
  @IsObject()
  @Transform(({ value }) => {
    if (!value || value === '') return undefined;
    if (typeof value !== 'string') return value;

    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  })
  workingHours?: object;

@ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    
    if (value === '' || value === null || value === undefined) return undefined;
    
    return value;
  })
  isBookingAvailable?: boolean;

  @IsOptional() // Fayl majburiy bo'lmasa
  file?: any;
}