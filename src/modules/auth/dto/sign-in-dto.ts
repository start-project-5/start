// src/modules/auth/dto/sign-in.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'assomad377@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd123' })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password: string;
}