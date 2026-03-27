import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { WorkingHoursDto } from './working-hours.dto';

export class CreateMuseumDto {
  @ApiProperty({ example: 'Davlat Tarix Muzeyi', maxLength: 150 })
  @IsString()
  @IsNotEmpty({ message: "Muzey nomi bo'lishi shart" })
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: "O'zbekiston tarixiga oid noyob eksponatlar..." })
  @IsString()
  @IsNotEmpty({ message: "Tavsif bo'sh bo'lmasligi kerak" })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  description: string;

  @ApiProperty({
    example: 'Mustaqillik maydoni, 1, Toshkent',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: "Manzil ko'rsatilishi shart" })
  @MaxLength(500)
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  address: string;

  @ApiPropertyOptional({ example: 'Toshkent' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Tarix' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 41.2995 })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return String(parseFloat(value));
  })
  @IsLatitude({ message: "Latitude -90 dan 90 gacha bo'lishi kerak" })
  latitude?: string;

  @ApiPropertyOptional({ example: 69.2401 })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return String(parseFloat(value));
  })
  @IsLongitude({ message: "Longitude -180 dan 180 gacha bo'lishi kerak" })
  longitude?: string;

  @ApiPropertyOptional({ example: 15000, description: "Kirish narxi (so'mda)" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  ticketPrice?: number;

  @ApiPropertyOptional({ type: WorkingHoursDto })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === '' || value === 'null') return undefined;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        const dto = new WorkingHoursDto();
        Object.assign(dto, parsed);
        return dto;
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isActive?: boolean;

  @IsOptional()
  file?: any;
}

// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { Transform, Type } from 'class-transformer';
// import {
//   IsBoolean, IsLatitude, IsLongitude, IsNotEmpty,
//   IsNumber, IsObject, IsOptional, IsString,
//   Max, MaxLength, Min, ValidateNested,
// } from 'class-validator';
// import { WorkingHoursDto } from './working-hours.dto';

// export class CreateMuseumDto {
//   @ApiProperty({ example: 'Davlat Tarix Muzeyi', maxLength: 150 })
//   @IsString()
//   @IsNotEmpty({ message: "Muzey nomi bo'lishi shart" })
//   @MaxLength(150)
//   name: string;

//   @ApiProperty({ example: "O'zbekiston tarixiga oid noyob eksponatlar..." })
//   @IsString()
//   @IsNotEmpty()
//   description: string;

//   @ApiProperty({ example: 'Mustaqillik maydoni, 1, Toshkent', maxLength: 500 })
//   @IsString()
//   @IsNotEmpty()
//   @MaxLength(500)
//   address: string;

//   @ApiPropertyOptional({ example: 'Toshkent' })
//   @IsOptional()
//   @IsString()
//   city?: string;

//   @ApiPropertyOptional({ example: 'Tarix' })
//   @IsOptional()
//   @IsString()
//   category?: string;

//   @ApiPropertyOptional({ example: 41.2995 })
//   @IsOptional()
//   @Transform(({ value }) => {
//     if (value === '' || value === null || value === undefined) return undefined;
//     return String(parseFloat(value));
//   })
//   @IsLatitude({ message: "Latitude -90 dan 90 gacha bo'lishi kerak" })
//   latitude?: string;

//   @ApiPropertyOptional({ example: 69.2401 })
//   @IsOptional()
//   @Transform(({ value }) => {
//     if (value === '' || value === null || value === undefined) return undefined;
//     return String(parseFloat(value));
//   })
//   @IsLongitude({ message: "Longitude -180 dan 180 gacha bo'lishi kerak" })
//   longitude?: string;

//   @ApiPropertyOptional({ example: 15000, description: "Kirish narxi (so'mda)" })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   @Type(() => Number)
//   ticketPrice?: number;

//   @ApiPropertyOptional({ type: WorkingHoursDto })
//   @IsOptional()
//   @Transform(({ value }) => {
//     if (!value || value === '' || value === 'null') return undefined;
//     if (typeof value === 'string') {
//       try {
//         const parsed = JSON.parse(value);
//         const dto = new WorkingHoursDto();
//         Object.assign(dto, parsed);
//         return dto;
//       } catch {
//         return value;
//       }
//     }
//     return value;
//   })
//   @IsObject()
//   @ValidateNested()
//   @Type(() => WorkingHoursDto)
//   workingHours?: WorkingHoursDto;

//   @ApiPropertyOptional({ example: true, default: true })
//   @IsOptional()
//   @IsBoolean()
//   @Transform(({ value }) => {
//     if (value === 'true' || value === true) return true;
//     if (value === 'false' || value === false) return false;
//     return undefined;
//   })
//   isActive?: boolean;

//   @IsOptional()
//   file?: any;
// }

// // import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// // import { Type } from 'class-transformer';
// // import {
// //   IsLatitude,
// //   IsLongitude,
// //   IsNotEmpty,
// //   IsNumber,
// //   IsOptional,
// //   IsString,
// //   IsUrl,
// //   MaxLength,
// // } from 'class-validator';

// // export class CreateMuseumDto {
// //   @ApiProperty({
// //     example: 'Oʻzbekiston Davlat Sanʼat Muzeyi',
// //     description: 'Muzeyning toʻliq nomi',
// //     maxLength: 150,
// //   })
// //   @IsString()
// //   @IsNotEmpty()
// //   @MaxLength(150)
// //   name: string;

// //   @ApiPropertyOptional({
// //     example: 'Ushbu muzey 1918-yilda tashkil etilgan boʻlib...',
// //     description: 'Muzey haqida batafsil maʼlumot',
// //   })
// //   @IsOptional()
// //   @IsString()
// //   description?: string;

// //   @ApiProperty({
// //     example: 'Toshkent sh., Amir Temur koʻchasi, 16-uy',
// //     description: 'Muzeyning fizik manzili',
// //   })
// //   @IsString()
// //   @IsNotEmpty()
// //   @MaxLength(500)
// //   address: string;

// //   // @ApiPropertyOptional({
// //   //   example: 'https://example.com/images/museum.jpg',
// //   //   description: 'Muzeyning asosiy rasm URL manzili',
// //   // })
// //   // @IsOptional()
// //   // @IsUrl({}, { message: "Rasm manzili toʻgʻri URL boʻlishi kerak" })
// //   // image?: string;

// //   @ApiPropertyOptional({ example: 41.311081, description: 'Geografik kenglik' })
// //   @IsOptional()
// //   @IsLatitude()
// //   // @IsNumber()
// //   @Type(() => Number)
// //   latitude?: number;

// //   @ApiPropertyOptional({ example: 69.240562, description: 'Geografik uzunlik' })
// //   @IsOptional()
// //   @IsLongitude()
// //   // @IsNumber()
// //   @Type(() => Number)
// //   longitude?: number;
// // }

