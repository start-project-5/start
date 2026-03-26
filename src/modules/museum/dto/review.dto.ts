import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from 'src/utils/pagination';

export class CreateReviewDto {
  @ApiProperty({ example: 5, description: '1 dan 5 gacha', minimum: 1, maximum: 5 })
  @IsInt({ message: 'Reyting butun son bo`lishi kerak' })
  @Min(1, { message: 'Reyting 1 dan kam bo`lmasin' })
  @Max(5, { message: 'Reyting 5 dan oshmasin' })
  @Type(() => Number)
  rating: number;

  @ApiPropertyOptional({ example: 'Juda ajoyib muzey, tavsiya qilaman!' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: 'uuid-of-museum' })
  @IsNotEmpty()
  @IsUUID()
  museumId: string;
}

export class FilterReviewDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  museumId?: string;
}