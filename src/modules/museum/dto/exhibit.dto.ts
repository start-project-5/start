import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export class CreateExhibitDto {
  @ApiProperty({ example: 'Oltın qilich', maxLength: 150 })
  @IsString()
  @IsNotEmpty({ message: "Eksponat nomi bo'lishi shart" })
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ example: 'Temuriylar davridan qolgan...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'XIV-XV asrlar' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isActive?: boolean;

  @ApiProperty({ example: 'uuid-of-museum' })
  @IsNotEmpty()
  @IsUUID()
  museumId: string;

  @IsOptional()
  file?: any;
}

export class UpdateExhibitDto extends PartialType(CreateExhibitDto) {
  @ApiPropertyOptional({ example: 'Yangi muzey nomi' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  name?: string;
}

export class CreateExhibitSwaggerDto extends CreateExhibitDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Eksponat rasmi (jpg, png, webp)',
  })
  declare file?: any;
}

export class UpdateExhibitSwaggerDto extends UpdateExhibitDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Yangi rasm (ixtiyoriy)',
  })
  declare file?: any;
}