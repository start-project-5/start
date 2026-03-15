import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateHotelDto {
  @ApiProperty({
    example: 'Hyatt Regency Tashkent',
    description: 'Mehmonxona nomi',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'Shahar markazidagi besh yulduzli premium mehmonxona...',
    description: 'Mehmonxona haqida batafsil maʼlumot',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Navoiy koʻchasi, 1A, Toshkent',
    description: 'Mehmonxonaning fizik manzili',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @ApiPropertyOptional({ 
    example: 41.2995, 
    description: "Geografik kenglik (Latitude)" 
  })
  @IsOptional()
  @IsLatitude({ message: "Latitude haqiqiy koordinata bo'lishi kerak (-90 dan 90 gacha)" })
  @IsNumber()
  @Type(() => Number) // Stringni songa aylantirish uchun o'ta muhim
  latitude?: number;

  @ApiPropertyOptional({ 
    example: 69.2401, 
    description: "Geografik uzunlik (Longitude)" 
  })
  @IsOptional()
  @IsLongitude({ message: "Longitude haqiqiy koordinata bo'lishi kerak (-180 dan 180 gacha)" })
  @IsNumber()
  @Type(() => Number)
  longitude?: number;
  
  // @ApiPropertyOptional({
  //   example: 'https://images.hotels.com/hyatt.jpg',
  //   description: 'Asosiy rasm URL manzili',
  // })
  // @IsOptional()
  // @IsUrl()
  // image?: string;

  @ApiPropertyOptional({
    example: 4.8,
    description: 'Mehmonxona reytingi (0.0 dan 5.0 gacha)',
    minimum: 0,
    maximum: 5,
    default: 0.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  @ApiProperty({
    example: 5,
    description: 'Yulduzlar soni',
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  stars: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Mehmonxona faolmi?',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}