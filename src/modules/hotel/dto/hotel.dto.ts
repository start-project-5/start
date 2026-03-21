import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmpty,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { WorkingHoursDto } from './workingHours.dto';

export class CreateHotelDto {
  @ApiPropertyOptional({
    example: 'Hyatt Regency Tashkent',
    description: 'Mehmonxona nomi',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty({ message: "Hotel nomi bo'lishi shart" })
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'Shahar markazidagi besh yulduzli premium mehmonxona...',
    description: 'Mehmonxona haqida batafsil maʼlumot',
  })
  @IsString()
  @IsNotEmpty({ message: "Tavsif bo'sh bo'lmasligi kerak" })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  description: string;

  @ApiPropertyOptional({
    example: 'Navoiy koʻchasi, 1A, Toshkent',
    description: 'Mehmonxonaning fizik manzili',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: "Qayerdaligini ko'rsatib keting" })
  @MaxLength(255)
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  address: string;

  @ApiPropertyOptional({
    example: 41.2995,
    description: 'Geografik kenglik (Latitude)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return String(parseFloat(value));
  })
  @IsLatitude({
    message: "Latitude haqiqiy koordinata bo'lishi kerak (-90 dan 90 gacha)",
  })
  latitude?: string;

  @ApiPropertyOptional({
    example: 69.2401,
    description: 'Geografik uzunlik (Longitude)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return String(parseFloat(value));
  })
  @IsLongitude({
    message: "Longitude haqiqiy koordinata bo'lishi kerak (-180 dan 180 gacha)",
  })
  longitude?: string;

  // @ApiPropertyOptional({
  //   example: 'https://images.hotels.com/hyatt.jpg',
  //   description: 'Asosiy rasm URL manzili',
  // })
  // @IsOptional()
  // @IsUrl()
  // image?: string;

  @ApiPropertyOptional({
    example: 4.8,
    description: 'Mehmonxona reytingi (0.0 dan 5.0 gacha)',
    minimum: 0,
    maximum: 5,
    default: 0.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Yulduzlar soni',
    minimum: 0,
    maximum: 5,
  })
  @IsNotEmpty({
    message: 'Mehmonxona nechi yulduzli ekanligi kiritilishi kerak',
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  stars: number;

  @ApiPropertyOptional({ type: WorkingHoursDto })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === '' || value === 'null') return undefined;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        const dtoInstance = new WorkingHoursDto();
        Object.assign(dtoInstance, parsed);
        return dtoInstance;
      } catch (e) {
        return value;
      }
    }
    return value;
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  retseptionTime?: WorkingHoursDto; // ← workingHours o'rniga

  @ApiPropertyOptional({
    example: true,
    description: 'Mehmonxona faolmi?',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;

    if (value === '' || value === null || value === undefined) return undefined;

    return value;
  })
  isAvailable?: boolean;

  @IsOptional() // Fayl majburiy bo'lmasa
  file?: any;
}
