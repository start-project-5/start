import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/utils/pagination";

export class AttractionFilterDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'Khiva' })
  @IsOptional()
  @IsString()
  search?: string;
 
  /**
   * Only passed by admin to see hidden attractions.
   * Public consumers always get isPublic=true (enforced in service).
   */
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublic?: boolean;
}