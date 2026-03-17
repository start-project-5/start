// src/modules/auth/dto/refresh-token.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Joriy refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}