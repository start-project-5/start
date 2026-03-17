import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { PriceRange } from 'src/common/enum/restaurant_price.enum';
import { WorkingHoursDto } from './workingHours.dto';

export class CreateRestaurantDto {
  @ApiProperty({
    example: 'Rayhon Milliy Taomlari',
    description: 'Restoran nomi',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Eng mazali milliy taomlar va shashliklar...',
    description: 'Restoran tavsifi',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ enum: PriceRange, default: PriceRange.MODERATE })
  @IsEnum(PriceRange)
  priceRange: PriceRange;

  @ApiProperty({
    example: "Toshkent sh., Lutfiy ko'chasi, 14-uy",
    description: 'Manzil',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: 41.2858, description: 'Latitude' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return String(parseFloat(value));
  })
  @IsLatitude()
  latitude?: string;

  @ApiPropertyOptional({ example: 69.2036, description: 'Longitude' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return String(parseFloat(value));
  })
  @IsLongitude()
  longitude?: string;

  @ApiPropertyOptional({ example: 4.5, minimum: 0, maximum: 5, default: 0.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  // @ApiPropertyOptional({ example: { mon: '09:00-22:00' } })
  // @IsOptional() // <--- BU JUDA MUHIM! Commentdan chiqaring
  // @IsObject()
  // @Transform(({ value }) => {
  //   if (!value || value === '') return undefined;
  //   if (typeof value !== 'string') return value;

  //   try {
  //     return JSON.parse(value);
  //   } catch (e) {
  //     return value;
  //   }
  // })
  // workingHours?: object;

  @ApiPropertyOptional({ type: WorkingHoursDto })
  @IsOptional()
  @Transform(({ value }) => {
    // 1. Bo'sh qiymatlarni qayta ishlash
    if (!value || value === '' || value === 'null') return undefined;

    // 2. Agar string bo'lib kelsa (Multipart/Form-data holati)
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);

        // MUHIM: Oddiy obyektni WorkingHoursDto klassiga aylantiramiz
        // Bu validatorga "bu begona emas, bizning klass" deb aytadi
        const dtoInstance = new WorkingHoursDto();
        Object.assign(dtoInstance, parsed);
        return dtoInstance;
      } catch (e) {
        return value; // JSON noto'g'ri bo'lsa, validator (IsObject) ushlaydi
      }
    }
    return value;
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;

    if (value === '' || value === null || value === undefined) return undefined;

    return value;
  })
  isBookingAvailable?: boolean;

  @IsOptional() // Fayl majburiy bo'lmasa
  file?: any;
}
