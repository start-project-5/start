import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateRestaurantDto } from "./restaurant.dto";

export class CreateRestaurantSwaggerDto extends CreateRestaurantDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Restaurant uchun rasm fayli (jpg, png)',
    required: false, // Odatda restaurant yangilaganda rasm yuborish majburiy emas
  })
  file?: any; 
}