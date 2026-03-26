import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/utils/pagination';

export class FilterMuseumDto extends PaginationDto {
  @ApiPropertyOptional({ description: "Nomi yoki tavsifi bo'yicha qidirish" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Shahar bo`yicha filter' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: "Kategoriya: Tarix, San'at..." })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Minimal reyting (0-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ description: "Maksimal kirish narxi (so'mda)" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Faol/nofaol muzeylar' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;
}

// import { ApiPropertyOptional } from '@nestjs/swagger';
// import { IsNumber, IsOptional, IsString } from 'class-validator';
// import { Type } from 'class-transformer';
// import { PaginationDto } from 'src/utils/pagination';

// export class FilterMuseumDto extends PaginationDto {
//   @ApiPropertyOptional({ description: "Nomi bo'yicha qidirish" })
//   @IsOptional()
//   @IsString()
//   search?: string;

//   @ApiPropertyOptional({ description: "Shahar bo'yicha filter" })
//   @IsOptional()
//   @IsString()
//   city?: string;

//   @ApiPropertyOptional({ description: 'Kategoriya: Tarix, Sanʼat...' })
//   @IsOptional()
//   @IsString()
//   category?: string;

//   @ApiPropertyOptional({ description: 'Minimal reyting (0-5)' })
//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber()
//   rating?: number;

//   @ApiPropertyOptional({ description: 'Maksimal narx' })
//   @IsOptional()
//   @Type(() => Number)
//   @IsNumber()
//   maxPrice?: number;

//   @ApiPropertyOptional({ description: 'Faol/nofaol' })
//   @IsOptional()
//   isActive?: boolean;
// }