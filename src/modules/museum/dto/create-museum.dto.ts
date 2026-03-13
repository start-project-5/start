import { IsOptional, IsString, Length } from 'class-validator';

export class CreateMuseumDto {
  @IsString() @Length(2, 150)   name: string;
  @IsString() @Length(10, 2000) description: string;
  @IsString() @Length(5, 255)   address: string;
  @IsOptional() @IsString()     image?: string;
}

