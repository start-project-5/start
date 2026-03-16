import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  IsObject,
} from 'class-validator';
import { PriceRange } from 'src/common/enum/restaurant_price.enum';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Rayhon Milliy Taomlari', description: 'Restoran nomi' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ 
    example: 'Eng mazali milliy taomlar va shashliklar...', 
    description: 'Restoran tavsifi' 
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: PriceRange, default: PriceRange.MODERATE })
  @IsEnum(PriceRange)
  priceRange: PriceRange;

  @ApiProperty({ example: 'Toshkent sh., Lutfiy koʻchasi, 14-uy', description: 'Manzil' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: 41.2858, description: 'Latitude' })
  @IsString()
  // @IsLatitude()
  // @Type(() => Number)
  latitude?: string;

  @ApiPropertyOptional({ example: 69.2036, description: 'Longitude' })
  @IsString()
  // @IsLongitude()
  // @Type(() => Number)
  longitude?: string;

  @ApiPropertyOptional({ example: 4.5, minimum: 0, maximum: 5, default: 0.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  @ApiProperty({
    example: {
      mon: "09:00-22:00",
      tue: "09:00-22:00",
      sun: "yopiq"
    },
    description: 'Ish vaqti haftalik formati'
  })
  @IsObject()
  @IsOptional()
  workingHours?: object;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isBookingAvailable?: boolean;
}

// import {
//   IsNumber,
//   IsOptional,
//   IsString,
//   Length,
//   Max,
//   Min,
// } from 'class-validator';

// export class CreateRestaurantDto {
//   @IsString()
//   @Length(2, 150)
//   name: string;

//   @IsString()
//   @Length(10, 2000)
//   description: string;

//   @IsString()
//   @Length(5, 255)
//   address: string;

//   @IsOptional()
//   @IsNumber({ maxDecimalPlaces: 7 })
//   latitude?: number;

//   @IsOptional()
//   @IsNumber({ maxDecimalPlaces: 7 })
//   longitude?: number;

//   @IsOptional()
//   @IsString()
//   image?: string;

//   @IsOptional()
//   @IsNumber({ maxDecimalPlaces: 1 })
//   @Min(0) @Max(5)
//   rating?: number;
// }

