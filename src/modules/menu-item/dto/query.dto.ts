import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/utils/pagination';
import { MenuItemStatus } from 'src/common/enum/menuitem-status';
import { MenuCategory } from 'src/common/enum/menu-category';

export class FilterRestaurantMenuDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Restoran ID bo\'yicha filtr' })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiPropertyOptional({ enum: MenuCategory })
  @IsOptional()
  @IsEnum(MenuCategory)
  category?: MenuCategory;

  @ApiPropertyOptional({ enum: MenuItemStatus })
  @IsOptional()
  @IsEnum(MenuItemStatus)
  status?: MenuItemStatus;

  @ApiPropertyOptional()
  @IsOptional()
  isAvailable?: boolean;
}