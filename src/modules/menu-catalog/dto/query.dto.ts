import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/utils/pagination';
import { MenuCategory } from 'src/common/enum/menu-category';

export class FilterMenuCatalogDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: MenuCategory })
  @IsOptional()
  @IsEnum(MenuCategory)
  category?: MenuCategory;

  @ApiPropertyOptional()
  @IsOptional()
  isVegetarian?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  isSpicy?: boolean;
}