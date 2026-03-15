import { IsString, IsOptional, IsUrl, IsNumber, Min, Max } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateProfileDto {
  @ApiPropertyOptional({ default: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ default: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ default: 'tashkent' })
  @IsOptional()
  @IsString()
  locationName?: string;

//   @ApiPropertyOptional({
//     example: 41.2995,
//     description: 'Joylashuv kengligi (Latitude)',
//     minimum: -90,
//     maximum: 90,
//   })
//   @IsOptional()
//   @IsNumber({}, { message: 'Latitude son boʻlishi kerak' })
//   @Min(-90, { message: 'Latitude -90 dan kichik boʻlishi mumkin emas' })
//   @Max(90, { message: 'Latitude 90 dan katta boʻlishi mumkin emas' })
//   latitude?: number;

//   @ApiPropertyOptional({
//     example: 69.2401,
//     description: 'Joylashuv uzunligi (Longitude)',
//     minimum: -180,
//     maximum: 180,
//   })
//   @IsOptional()
//   @IsNumber({}, { message: 'Longitude son boʻlishi kerak' })
//   @Min(-180, { message: 'Longitude -180 dan kichik boʻlishi mumkin emas' })
//   @Max(180, { message: 'Longitude 180 dan katta boʻlishi mumkin emas' })
//   longitude?: number;
}