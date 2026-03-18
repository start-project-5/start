import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { WeekDay } from "src/common/enum/weekends.enum";
import { PaginationDto } from "src/utils/pagination";

export class GuideFilterDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'Natanyahu' })
  @IsOptional()
  @IsString()
  search?: string;
 
  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  @IsString()
  language?: string;
 
  @ApiPropertyOptional({ enum: WeekDay })
  @IsOptional()
  @IsEnum(WeekDay)
  availableDay?: WeekDay;
 
  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRate?: number;
 
  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxRate?: number;
 
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}