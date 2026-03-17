import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UpdateProfileDto } from "./update-profile.dto";

export class UpdateProfileSwaggerDto extends UpdateProfileDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Profil uchun rasm fayli (jpg, png)',
    required: false, // Odatda profil yangilaganda rasm yuborish majburiy emas
  })
  file?: any; 
}