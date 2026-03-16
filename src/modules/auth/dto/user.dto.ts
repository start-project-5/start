import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { NAME_REGEX } from 'src/common/enum/regix.enum';
import { UserRole } from 'src/common/enum/user-role.enum';

// ─────────────────────────────────────────────────────────────
// MAVJUD DTOlar (o'zgartirilmadi)
// ─────────────────────────────────────────────────────────────

export class CreateUserDto {
  @ApiProperty({
    example: 'Qudrat',
    description: "Foydalanuvchining to'liq ismi (faqat harflar)",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100, { message: "Ism 2 tadan 100 tagacha belgidan iborat bo'lishi kerak" })
  @Matches(NAME_REGEX, { message: 'Ismda faqat harflar ishtirok etishi mumkin' })
  name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: "Foydalanuvchi elektron manzili (unikal bo'lishi kerak)",
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    description: 'Kamida 6 ta belgidan iborat maxfiy parol',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'password must be at least 6 characters' })
  password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;
}

// ─────────────────────────────────────────────────────────────
// AUTH DTOlar — ro'yxatdan o'tish va tizimga kirish
// ─────────────────────────────────────────────────────────────

export class SignUpDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiProperty({ example: 'P@ssw0rd123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'password must be at least 6 characters' })
  password: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.TOURIST })
  @IsOptional()
  @IsEnum(UserRole, { message: "Noto'g'ri rol kiritildi" })
  role?: UserRole;
}

export class SignInDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiProperty({ example: 'P@ssw0rd123' })
  @IsString()
  @IsNotEmpty({ message: "Parol bo'sh bo'lmasligi kerak" })
  password: string;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiProperty({ example: '847392', description: '6 xonali OTP kodi' })
  @IsString()
  @IsNotEmpty({ message: "OTP kodi bo'sh bo'lmasligi kerak" })
  otpCode: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiProperty({ example: '847392', description: '6 xonali OTP kodi' })
  @IsString()
  @IsNotEmpty({ message: "OTP kodi bo'sh bo'lmasligi kerak" })
  otpCode: string;

  @ApiProperty({ example: 'NewP@ss123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'password must be at least 6 characters' })
  newPassword: string;
}