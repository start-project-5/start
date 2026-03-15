import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { NAME_REGEX } from 'src/common/enum/regix.enum';

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