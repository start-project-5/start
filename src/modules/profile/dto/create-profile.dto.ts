import { IsString, IsOptional, IsNotEmpty, Length, IsLatitude, IsNumber, IsLongitude } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateProfileDto {
  @IsString({ message: "string bo'lishi kerak" })
  @Length(2, 100)
  @ApiPropertyOptional({ default: "ali" })
  lastName?: string;

  @IsString({ message: "string bo'lishi kerak" })
  @Length(2, 100)
  @ApiProperty({ default: "ali" })
  firstName: string;

  @IsOptional() // Agar ma'lumot kelmasa, validator xato bermaydi
  @IsString()
  @ApiPropertyOptional({
    default: "Toshkent",
    description: "Foydalanuvchi yashash manzili (ixtiyoriy)",
  })
  locationName?: string; // "?" belgisi TypeScript'da bu maydon bo'lmasligi mumkinligini bildiradi

  @ApiPropertyOptional({ 
    example: 41.2995, 
    description: "Geografik kenglik (Latitude)" 
  })
  @IsOptional()
  @IsLatitude({ message: "Latitude haqiqiy koordinata bo'lishi kerak (-90 dan 90 gacha)" })
  @IsNumber()
  @Type(() => Number) // Stringni songa aylantirish uchun o'ta muhim
  latitude?: number;

  @ApiPropertyOptional({ 
    example: 69.2401, 
    description: "Geografik uzunlik (Longitude)" 
  })
  @IsOptional()
  @IsLongitude({ message: "Longitude haqiqiy koordinata bo'lishi kerak (-180 dan 180 gacha)" })
  @IsNumber()
  @Type(() => Number)
  longitude?: number;
}
