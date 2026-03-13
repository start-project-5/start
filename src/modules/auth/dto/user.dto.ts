import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

/**
 * CreateUserDto — data required to register a new user.
 *
 * The ValidationPipe in main.ts applies these rules automatically.
 * If a rule fails, NestJS returns 400 with a clear error message.
 */
export class CreateUserDto {
  /** Full name between 2 and 100 characters */
  @IsString()
  @Length(2, 100)
  name: string;

  /** Must be a valid email format, e.g. "ali@example.com" */
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  /** Minimum 6 characters — will be hashed before saving */
  @IsString()
  @MinLength(6, { message: 'password must be at least 6 characters' })
  password: string;
}

/**
 * UpdateUserDto — fields the user can change on their profile.
 * Every field is optional: they can update just name, or just photo, etc.
 */

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;
}