import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class WorkingHoursDto {
  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  monday?: string;

  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  tuesday?: string;

  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  wednesday?: string;

  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  thursday?: string;

  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  friday?: string;

  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  saturday?: string;

  @ApiPropertyOptional({ example: '09:00-22:00' })
  @IsOptional()
  @IsString()
  sunday?: string;
}