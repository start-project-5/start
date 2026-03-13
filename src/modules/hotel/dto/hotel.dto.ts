import { IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateHotelDto {
  @IsString() @Length(2, 150)   name: string;
  @IsString() @Length(10, 2000) description: string;
  @IsString() @Length(5, 255)   address: string;
  @IsOptional() @IsString()     image?: string;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 1 }) @Min(0) @Max(5) rating?: number;
}

