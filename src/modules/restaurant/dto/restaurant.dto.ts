import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @Length(2, 150)
  name: string;

  @IsString()
  @Length(10, 2000)
  description: string;

  @IsString()
  @Length(5, 255)
  address: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 7 })
  latitude?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 7 })
  longitude?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0) @Max(5)
  rating?: number;
}

