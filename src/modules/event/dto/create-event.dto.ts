import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  IsLatitude,
  IsLongitude,
  Min,
} from 'class-validator';
import { EventStatus } from 'src/common/enum/eventSatatus.enum';

export class CreateEventDto {
  @ApiProperty({ example: 'Xiva Musiqa Festivali', description: 'Tadbir nomi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Festival haqida batafsil...', description: 'Tavsif' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Ichan Qalʼa, Xiva', description: 'Oʻtkazilish joyi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location: string;

  @ApiPropertyOptional({ example: 41.3785, description: 'Kenglik (Latitude)' })
  @IsOptional()
  @IsLatitude()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: 60.3639, description: 'Uzunlik (Longitude)' })
  @IsOptional()
  @IsLongitude()
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({ example: '2026-03-20T10:00:00Z', description: 'Boshlanish vaqti' })
  @IsDate()
  @Type(() => Date) // String ko'rinishidagi sanani Date obyektiga aylantiradi
  startDate: Date;

  @ApiPropertyOptional({ example: '2026-03-21T18:00:00Z', description: 'Tugash vaqti' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({ enum: EventStatus, default: EventStatus.DRAFT })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiProperty({ example: 'Madaniyat Vazirligi', description: 'Tashkilotchi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  organizer: string;

  @ApiProperty({ example: 50000.00, description: 'Narxi (0 boʻlsa bepul)', default: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 500, description: 'Maksimal odam soni', default: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  capacity: number;
}
