import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantDto } from './restaurant.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  @ApiPropertyOptional({ example: 'Yangi restoran nomi' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  name?: string;
}