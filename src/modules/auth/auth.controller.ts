// src/modules/auth/auth.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService, AuthTokens } from './auth.service';
import { CreateUserDto } from './user/dto/user.dto';
// import { SignInDto } from './dto/sign-in.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
// import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './user/user.entity';
import { SignInDto } from './dto/sign-in-dto';
import { ResetPasswordDto } from './dto/rest-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─────────────────────────────────────────────────────────────
  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yangi foydalanuvchi ro\'yxatdan o\'tkazish' })
  @ApiResponse({ status: 201, description: 'OTP emailga yuborildi' })
  @ApiResponse({ status: 400, description: 'Email band' })
  signUp(@Body() dto: CreateUserDto): Promise<{ message: string }> {
    return this.authService.signUp(dto);
  }

  // ─────────────────────────────────────────────────────────────
  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Email tasdiqlash (OTP orqali)' })
  @ApiResponse({ status: 200, description: 'Email tasdiqlandi' })
  @ApiResponse({ status: 400, description: 'OTP noto\'g\'ri yoki muddati o\'tgan' })
  verifyEmail(@Body() dto: VerifyOtpDto): Promise<{ message: string }> {
    return this.authService.verifyEmail(dto);
  }

  // ─────────────────────────────────────────────────────────────
  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tizimga kirish' })
  @ApiResponse({ status: 200, description: 'Access va refresh token qaytariladi' })
  @ApiResponse({ status: 401, description: 'Noto\'g\'ri ma\'lumotlar' })
  @ApiResponse({ status: 403, description: 'Email tasdiqlanmagan / Hisob bloklangan' })
  signIn(@Body() dto: SignInDto): Promise<AuthTokens> {
    return this.authService.signIn(dto);
  }

  // ─────────────────────────────────────────────────────────────
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Parolni tiklash uchun OTP yuborish' })
  @ApiResponse({ status: 200, description: 'OTP emailga yuborildi' })
  forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  // ─────────────────────────────────────────────────────────────
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'OTP orqali yangi parol o\'rnatish' })
  @ApiResponse({ status: 200, description: 'Parol yangilandi' })
  @ApiResponse({ status: 400, description: 'OTP noto\'g\'ri yoki muddati o\'tgan' })
  resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }

  // ─────────────────────────────────────────────────────────────
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh token orqali yangi access token olish' })
  @ApiResponse({ status: 200, description: 'Yangi token juftligi qaytariladi' })
  @ApiResponse({ status: 401, description: 'Token yaroqsiz' })
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refresh(dto);
  }

  // ─────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tizimdan chiqish (refresh token o\'chiriladi)' })
  @ApiResponse({ status: 200, description: 'Chiqildi' })
  @ApiResponse({ status: 401, description: 'Avtorizatsiya kerak' })
  logout(@Req() req: Request & { user: User }): Promise<{ message: string }> {
    return this.authService.logout(req.user.id);
  }
}