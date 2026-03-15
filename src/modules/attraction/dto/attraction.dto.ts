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
  MaxLength,
} from 'class-validator';

export class CreateAttractionDto {
  @ApiProperty({
    example: 'Ichan Qalʼa',
    description: 'Joyning toʻliq nomi',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'Xiva shahridagi qadimiy meʼmoriy yodgorlik...',
    description: 'Joy haqida batafsil maʼlumot',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Xorazm viloyati, Xiva shahri',
    description: 'Fizik manzil',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @ApiPropertyOptional({ example: 41.3783, description: 'Kenglik (Latitude)' })
  @IsOptional()
  @IsLatitude()
  @IsNumber()
  @Type(() => Number) // Form-data orqali kelsa, stringni numberga o'tkazadi
  latitude?: number;

  @ApiPropertyOptional({ example: 60.3639, description: 'Uzunlik (Longitude)' })
  @IsOptional()
  @IsLongitude()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  // @ApiPropertyOptional({
  //   example: 'https://example.com/images/ichan-qala.jpg',
  //   description: 'Asosiy rasm URL manzili',
  // })
  // @IsOptional()
  // @IsUrl()
  // image?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Joy tashrif buyuruvchilar uchun ochiqmi?',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}