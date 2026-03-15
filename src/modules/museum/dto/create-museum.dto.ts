import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateMuseumDto {
  @ApiProperty({
    example: 'Oʻzbekiston Davlat Sanʼat Muzeyi',
    description: 'Muzeyning toʻliq nomi',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'Ushbu muzey 1918-yilda tashkil etilgan boʻlib...',
    description: 'Muzey haqida batafsil maʼlumot',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Toshkent sh., Amir Temur koʻchasi, 16-uy',
    description: 'Muzeyning fizik manzili',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address: string;

  // @ApiPropertyOptional({
  //   example: 'https://example.com/images/museum.jpg',
  //   description: 'Muzeyning asosiy rasm URL manzili',
  // })
  // @IsOptional()
  // @IsUrl({}, { message: "Rasm manzili toʻgʻri URL boʻlishi kerak" })
  // image?: string;

  @ApiPropertyOptional({ example: 41.311081, description: 'Geografik kenglik' })
  @IsOptional()
  @IsLatitude()
  // @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: 69.240562, description: 'Geografik uzunlik' })
  @IsOptional()
  @IsLongitude()
  // @IsNumber()
  @Type(() => Number)
  longitude?: number;
}

