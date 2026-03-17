// src/modules/auth/dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'ali@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '847291' })
  @IsString()
  @Length(6, 6, { message: 'OTP 6 xonali bo\'lishi kerak' })
  otpCode: string;

  @ApiProperty({ example: 'NewSecret123!' })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  newPassword: string;
}