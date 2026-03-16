import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

import { User } from './entity/auth.entity';
import { UserRole } from 'src/common/enum/user-role.enum';
import {
  SignUpDto,
  SignInDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/user.dto';
import { generateOtp } from 'src/utils/otp-generator';
import { sendVerificationEmail, sendPasswordResetEmail } from 'src/utils/email-sender';

// OTP amal qilish muddati — 5 daqiqa
const OTP_TTL_MS = 5 * 60 * 1000;

// Bcrypt salt rounds
const SALT_ROUNDS = 10;

// HttpOnly cookie nomi
const REFRESH_COOKIE = 'refreshToken';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  // ═══════════════════════════════════════════════════════════
  //  PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Access Token (15 min) + Refresh Token (7 kun) juftini yaratadi
   */
  private async createTokenPair(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      // Access token — qisqa muddatli, barcha ma'lumotlar bilan
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
      ),
      // Refresh token — uzoq muddatli, minimal payload
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Refresh tokenni bcrypt bilan hash qilib DB'ga saqlaydi
   * Xom token hech qachon DB'da saqlanmaydi
   */
  private async saveHashedRefreshToken(userId: string, rawToken: string): Promise<void> {
    const hashed = await bcrypt.hash(rawToken, SALT_ROUNDS);
    await this.userRepo.update(userId, { refreshToken: hashed });
  }

  /**
   * Refresh tokenni HttpOnly cookie sifatida o'rnatadi
   * JS orqali o'qib bo'lmaydi — XSS himoyasi
   */
  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun ms
      path: '/',
    });
  }

  /**
   * OTP muddati o'tib ketganini tekshiradi (5 daqiqa)
   */
  private isOtpExpired(createdAt: Date): boolean {
    return Date.now() - new Date(createdAt).getTime() > OTP_TTL_MS;
  }

  /**
   * Javobda maxfiy maydonlarni olib tashlaydi
   */
  private sanitize(user: User): Partial<User> {
    const { password, refreshToken, otpCode, otpCreatedAt, ...safe } = user;
    return safe;
  }

  // ═══════════════════════════════════════════════════════════
  //  RO'YXATDAN O'TISH
  // ═══════════════════════════════════════════════════════════

  /**
   * Yangi foydalanuvchini ro'yxatdan o'tkazish
   *
   * 1. Email band emasligini tekshirish
   * 2. Parolni hash qilish
   * 3. OTP yaratish va emailga yuborish
   * 4. GUIDE / BUSINESS_OWNER → isApprovedByAdmin: false
   *    TOURIST / ADMIN        → isApprovedByAdmin: true
   * 5. isVerified: false bilan saqlash
   */
  async signUp(dto: SignUpDto): Promise<{ message: string }> {
    // Email allaqachon band ekanligini tekshirish
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new BadRequestException("Bu email allaqachon ro'yxatdan o'tgan");
    }

    const role = dto.role ?? UserRole.TOURIST;

    // GUIDE va BUSINESS_OWNER rollar admin tasdiqini kutadi
    const needsApproval = role === UserRole.GUIDE || role === UserRole.BUSINESS_OWNER;

    const otpCode = generateOtp();

    const user = this.userRepo.create({
      email: dto.email,
      password: await bcrypt.hash(dto.password, SALT_ROUNDS),
      role,
      isVerified: false,
      isApprovedByAdmin: !needsApproval,
      otpCode,
      otpCreatedAt: new Date(),
    });

    await this.userRepo.save(user);

    // Tasdiqlash OTP kodini emailga yuborish
    await sendVerificationEmail(dto.email, otpCode);

    return {
      message:
        "Ro'yxatdan muvaffaqiyatli o'tdingiz! Emailingizga yuborilgan 6 xonali kodni kiriting.",
    };
  }

  // ═══════════════════════════════════════════════════════════
  //  EMAIL TASDIQLASH
  // ═══════════════════════════════════════════════════════════

  /**
   * OTP kodi orqali emailni tasdiqlash
   *
   * 1. Foydalanuvchi mavjudligini tekshirish
   * 2. Email allaqachon tasdiqlanmaganini tekshirish
   * 3. OTP kodi to'g'riligini tekshirish
   * 4. OTP muddatini tekshirish (5 daqiqa)
   * 5. isVerified: true qilish, OTP tozalash
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    if (user.isVerified) {
      throw new BadRequestException('Email allaqachon tasdiqlangan');
    }

    if (user.otpCode !== dto.otpCode) {
      throw new BadRequestException("OTP kodi noto'g'ri");
    }

    if (!user.otpCreatedAt || this.isOtpExpired(user.otpCreatedAt)) {
      throw new BadRequestException("OTP kodining muddati tugagan. Yangi kod so'rang");
    }

    await this.userRepo.update(user.id, {
      isVerified: true,
      otpCode: null,
      otpCreatedAt: null,
    });

    return { message: 'Email muvaffaqiyatli tasdiqlandi! Tizimga kirishingiz mumkin.' };
  }

  // ═══════════════════════════════════════════════════════════
  //  TIZIMGA KIRISH
  // ═══════════════════════════════════════════════════════════

  /**
   * Foydalanuvchini tizimga kiritish
   *
   * 1. Email va parolni solishtirish
   * 2. Email tasdiqlanganini tekshirish
   * 3. GUIDE / BUSINESS_OWNER uchun admin tasdiqini tekshirish
   * 4. Token juftini yaratish
   * 5. Refresh tokenni hash qilib DB'ga saqlash
   * 6. Refresh tokenni HttpOnly cookie'ga o'rnatish
   */
  async signIn(
    dto: SignInDto,
    res: Response,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    // Xavfsizlik: email mavjud-yo'qligini bildirmaslik
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException("Email yoki parol noto'g'ri");
    }

    // Email tasdiqlanmagan
    if (!user.isVerified) {
      throw new ForbiddenException(
        'Email tasdiqlanmagan. Iltimos emailingizni tasdiqlang',
      );
    }

    // Admin tasdiqini kutayotgan foydalanuvchi
    if (
      (user.role === UserRole.GUIDE || user.role === UserRole.BUSINESS_OWNER) &&
      !user.isApprovedByAdmin
    ) {
      throw new ForbiddenException(
        'Hisobingiz hali admin tomonidan tasdiqlanmagan. Iltimos kuting',
      );
    }

    const { accessToken, refreshToken } = await this.createTokenPair(
      user.id,
      user.email,
      user.role,
    );

    await this.saveHashedRefreshToken(user.id, refreshToken);
    this.setRefreshCookie(res, refreshToken);

    return { accessToken, user: this.sanitize(user) };
  }

  // ═══════════════════════════════════════════════════════════
  //  TIZIMDAN CHIQISH
  // ═══════════════════════════════════════════════════════════

  /**
   * Tizimdan chiqish — DB'dagi refresh tokenni o'chiradi, cookie'ni tozalaydi
   */
  async signOut(userId: string, res: Response): Promise<{ message: string }> {
    await this.userRepo.update(userId, { refreshToken: null });
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return { message: 'Tizimdan muvaffaqiyatli chiqdingiz' };
  }

  // ═══════════════════════════════════════════════════════════
  //  PERSISTENT LOGIN — TOKEN YANGILASH
  // ═══════════════════════════════════════════════════════════

  /**
   * Refresh Token orqali yangi Access Token olish (Auto-login)
   *
   * Token Rotation — har safar yangi refresh token ham beriladi
   * Eski refresh token bekor bo'ladi (replay attack himoyasi)
   */
  async refreshTokens(user: User, res: Response): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken: newRefresh } = await this.createTokenPair(
      user.id,
      user.email,
      user.role,
    );

    await this.saveHashedRefreshToken(user.id, newRefresh);
    this.setRefreshCookie(res, newRefresh);

    return { accessToken };
  }

  // ═══════════════════════════════════════════════════════════
  //  PAROLNI TIKLASH
  // ═══════════════════════════════════════════════════════════

  /**
   * Parol tiklash uchun OTP kodi yuborish
   * Xavfsizlik: foydalanuvchi topilmasa ham bir xil javob (email enumeration oldini olish)
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const SAFE_MSG = "Agar bu email ro'yxatdan o'tgan bo'lsa, parol tiklash kodi yuboriladi";

    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) return { message: SAFE_MSG };

    const otpCode = generateOtp();
    await this.userRepo.update(user.id, { otpCode, otpCreatedAt: new Date() });
    await sendPasswordResetEmail(dto.email, otpCode);

    return { message: SAFE_MSG };
  }

  /**
   * OTP kodi va yangi parol bilan parolni tiklash
   *
   * 1. Foydalanuvchi mavjudligini tekshirish
   * 2. OTP kodi to'g'riligini tekshirish
   * 3. OTP muddatini tekshirish (5 daqiqa)
   * 4. Yangi parolni hash qilib saqlash
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    if (user.otpCode !== dto.otpCode) {
      throw new BadRequestException("OTP kodi noto'g'ri");
    }

    if (!user.otpCreatedAt || this.isOtpExpired(user.otpCreatedAt)) {
      throw new BadRequestException("OTP kodining muddati tugagan. Yangi kod so'rang");
    }

    await this.userRepo.update(user.id, {
      password: await bcrypt.hash(dto.newPassword, SALT_ROUNDS),
      otpCode: null,
      otpCreatedAt: null,
    });

    return { message: "Parol muvaffaqiyatli yangilandi! Yangi parol bilan kiring." };
  }

  // ═══════════════════════════════════════════════════════════
  //  PROFIL
  // ═══════════════════════════════════════════════════════════

  /**
   * Joriy foydalanuvchi profilini qaytaradi (maxfiy maydonlarsiz)
   */
  getProfile(user: User): Partial<User> {
    return this.sanitize(user);
  }
}