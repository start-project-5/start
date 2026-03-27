import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateGalleryDto {
  @ApiPropertyOptional({ example: 'Asosiy zal rasmi' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  caption?: string;

  @ApiPropertyOptional({ example: 1, description: 'Tartib raqami' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ApiProperty({ example: 'uuid-of-museum' })
  @IsNotEmpty()
  @IsUUID()
  museumId: string;

  @IsOptional()
  file?: any;
}

export class UpdateGalleryDto extends PartialType(CreateGalleryDto) {}

export class CreateGallerySwaggerDto extends CreateGalleryDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Galereya rasmi (jpg, png, webp)',
  })
  declare file?: any;
}

export class UpdateGallerySwaggerDto extends UpdateGalleryDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Yangi rasm (ixtiyoriy)',
  })
  declare file?: any;
}