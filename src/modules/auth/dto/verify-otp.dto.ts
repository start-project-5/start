// src/modules/auth/dto/verify-otp.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: 'ali@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '847291', description: '6 xonali OTP kod' })
  @IsString()
  @Length(6, 6, { message: 'OTP 6 xonali bo\'lishi kerak' })
  otpCode: string;
}