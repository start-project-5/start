
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserService } from './user/user.service';
import { User } from './user/user.entity';
import { generateOtp } from '../../utils/otp-generator';
import { EmailSender } from '../../utils/email-sender';

import { CreateUserDto } from './user/dto/user.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserRole } from 'src/common/enum/user-role.enum';
import { SignInDto } from './dto/sign-in-dto';
import { ResetPasswordDto } from './dto/rest-password.dto';

// ─── Tip ta'riflar ────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── Rollari admin tasdig'ini talab qiladiganlar ──────────────
const ROLES_REQUIRING_APPROVAL: UserRole[] = [UserRole.GUIDE,UserRole.BUSINESS_OWNER];

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailSender: EmailSender,
  ) {}

  // ═══════════════════════════════════════════════════════════════
  /** Yangi foydalanuvchini ro'yxatdan o'tkazish
   *  Controller → AuthService → UserService → DB
   */
  // ═══════════════════════════════════════════════════════════════
  async signUp(dto: CreateUserDto): Promise<{ message: string }> {
    // Email band ekanligini tekshirish
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Bu email allaqachon ro\'yxatdan o\'tgan');
    }

    // Parolni bcrypt bilan hash qilish
    const hashedPassword = await this.hashValue(dto.password);

    // OTP generatsiya
    const otp = generateOtp();

    // UserService orqali foydalanuvchi yaratish
    await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.TOURIST,          // Default rol
      isVerified: false,
      isActive: true,
      isApprovedByAdmin: false,
      otpCode: otp,
      otpCreatedAt: new Date(),
    });

    // OTP emailga yuborish
    await this.emailSender.sendOtpEmail(
      dto.email,
      otp,
    );

    return {
      message: 'Ro\'yxatdan o\'tdingiz. Emailingizga tasdiqlash kodi yuborildi.',
    };
  }

  // ═══════════════════════════════════════════════════════════════
  /** Emailni OTP kod orqali tasdiqlash */
  // ═══════════════════════════════════════════════════════════════
  async verifyEmail(dto: VerifyOtpDto): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email allaqachon tasdiqlangan');
    }

    // OTP to'g'riligini va muddatini tekshirish
    this.validateOtp(user, dto.otpCode);

    // Email tasdiqlash va OTP tozalash (bir vaqtda)
    await Promise.all([
      this.userService.markEmailVerified(user.id),
      this.userService.clearOtp(user.id),
    ]);

    return { message: 'Email muvaffaqiyatli tasdiqlandi' };
  }

  // ═══════════════════════════════════════════════════════════════
  /** Tizimga kirish — JWT access + refresh token qaytaradi */
  // ═══════════════════════════════════════════════════════════════
  async signIn(dto: SignInDto): Promise<AuthTokens> {
    // Password + refreshToken ni select qilib topish
    const user = await this.userService.findByEmailWithPassword(dto.email);
    
    // console.log('User topildi:', user ? 'HA' : 'YOQ');
    
    if (!user) {
      // Xavfsizlik: "email yoki parol noto'g'ri" deb xabar berish
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }

    // Parol solishtirish
    const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri');
    }

    // Email tasdiqlanganligini tekshirish
    if (!user.isVerified) {
      throw new ForbiddenException(
        'Emailingiz tasdiqlanmagan. Iltimos, emailni tasdiqlang.',
      );
    }

    // Hisob aktiv ekanligini tekshirish
    if (!user.isActive) {
      throw new ForbiddenException(
        'Hisobingiz bloklangan. Admin bilan bog\'laning.',
      );
    }

    // GUIDE va BUSINESS_OWNER uchun admin tasdig'ini tekshirish
    if (
      ROLES_REQUIRING_APPROVAL.includes(user.role) &&
      !user.isApprovedByAdmin
    ) {
      throw new ForbiddenException(
        'Hisobingiz admin tomonidan hali tasdiqlanmagan. Kuting.',
      );
    }

    // Tokenlar generatsiya
    const tokens = await this.generateTokens(user);

    // Refresh tokenni hash qilib saqlash
    const hashedRefresh = await this.hashValue(tokens.refreshToken);
    await this.userService.saveRefreshToken(user.id, hashedRefresh);

    return tokens;
  }

  // ═══════════════════════════════════════════════════════════════
  /** Parolni unutish — emailga OTP yuborish */
  // ═══════════════════════════════════════════════════════════════
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(dto.email);

    // Xavfsizlik: email mavjud bo'lmasa ham bir xil javob
    if (!user) {
      return {
        message: 'Agar bu email ro\'yxatdan o\'tgan bo\'lsa, kod yuborildi.',
      };
    }

    const otp = generateOtp();
    await this.userService.saveOtp(user.id, otp);

    await this.emailSender.sendOtp(dto.email, otp, 'Parolni tiklash kodi');

    return { message: 'Parolni tiklash kodi emailingizga yuborildi.' };
  }

  // ═══════════════════════════════════════════════════════════════
  /** OTP orqali yangi parol o'rnatish */
  // ═══════════════════════════════════════════════════════════════
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // OTP tekshirish
    this.validateOtp(user, dto.otpCode);

    // Yangi parolni hash qilish
    const hashedPassword = await this.hashValue(dto.newPassword);

    // Parolni yangilash va OTP tozalash
    await Promise.all([
      this.userService.updatePassword(user.id, hashedPassword),
      this.userService.clearOtp(user.id),
    ]);

    return { message: 'Parol muvaffaqiyatli yangilandi.' };
  }

  // ═══════════════════════════════════════════════════════════════
  /** Refresh token orqali yangi access token olish (rotation bilan) */
  // ═══════════════════════════════════════════════════════════════
  async refresh(dto: RefreshTokenDto): Promise<AuthTokens> {
    // Refresh tokenni verify qilish
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token yaroqsiz yoki muddati o\'tgan');
    }

    // DB dan foydalanuvchini topish (refreshToken select:false)
    const user = await this.userService.findByIdWithRefreshToken(payload.sub);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException(
        'Foydalanuvchi topilmadi yoki tizimdan chiqilgan',
      );
    }

    // Kelgan refresh token DB dagi hash bilan solishtiriladi
    const isTokenValid = await bcrypt.compare(
      dto.refreshToken,
      user.refreshToken,
    );
    if (!isTokenValid) {
      throw new UnauthorizedException('Refresh token mos kelmadi');
    }

    // Yangi tokenlar generatsiya (Refresh Rotation)
    const tokens = await this.generateTokens(user);
    const hashedRefresh = await this.hashValue(tokens.refreshToken);
    await this.userService.saveRefreshToken(user.id, hashedRefresh);

    return tokens;
  }

  // ═══════════════════════════════════════════════════════════════
  /** Tizimdan chiqish — refresh tokenni DB dan o'chirish */
  // ═══════════════════════════════════════════════════════════════
  async logout(userId: string): Promise<{ message: string }> {
    await this.userService.saveRefreshToken(userId, null);
    return { message: 'Tizimdan muvaffaqiyatli chiqildi.' };
  }

  // ═══════════════════════════════════════════════════════════════
  // PRIVATE HELPER METODLAR
  // ═══════════════════════════════════════════════════════════════

  /** Access va refresh JWT tokenlarini yaratish */
  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES', '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES', '7d') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /** Qiymatni bcrypt bilan hash qilish */
  private async hashValue(value: string): Promise<string> {
    const salt = Number(this.configService.get<number>('BCRYPT_SALT', 10));
    return bcrypt.hash(value, salt);
  }

  /** OTP to'g'riligini va muddatini tekshirish — umumiy helper */
  private validateOtp(user: User, inputOtp: string): void {
    if (!user.otpCode || !user.otpCreatedAt) {
      throw new BadRequestException('OTP kod topilmadi. Qayta so\'rang.');
    }

    if (user.otpCode !== inputOtp) {
      throw new BadRequestException('OTP kod noto\'g\'ri');
    }

    const otpExpiresMs = Number(
      this.configService.get<number>('OTP_EXPIRES_MS', 300000),
    );
    const elapsed = Date.now() - new Date(user.otpCreatedAt).getTime();

    if (elapsed > otpExpiresMs) {
      throw new BadRequestException(
        `OTP kod muddati o'tgan. ${otpExpiresMs / 60000} daqiqa ichida ishlatilishi kerak.`,
      );
    }
  }
}