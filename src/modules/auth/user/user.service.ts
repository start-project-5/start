// src/modules/auth/user/user.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/user.dto';

/** Foydalanuvchilar bilan DB operatsiyalarini boshqaruvchi servis */
@Injectable()
export class UserService {
    removeById(id: string) {
        throw new Error('Method not implemented.');
    }
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ─────────────────────────────────────────────────────────────
  /** Yangi foydalanuvchi yaratib DB ga saqlash */
  // ─────────────────────────────────────────────────────────────
  async create(dto: CreateUserDto & Partial<User>): Promise<User> {
    try {
      const user = this.userRepo.create(dto);
      return await this.userRepo.save(user);
    } catch (error: any) {
      // PostgreSQL unique violation error kodi
      if (error?.code === '23505') {
        throw new ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan');
      }
      throw new InternalServerErrorException('Foydalanuvchi yaratishda xatolik');
    }
  }

  // ─────────────────────────────────────────────────────────────
  /** Email bo'yicha foydalanuvchi topish (password select:false — maxfiy) */
  // ─────────────────────────────────────────────────────────────
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  // ─────────────────────────────────────────────────────────────
  /** Email + parol bilan topish — login uchun (password qo'shib olinadi) */
  // ─────────────────────────────────────────────────────────────
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  // ─────────────────────────────────────────────────────────────
  /** ID bo'yicha foydalanuvchi topish */
  // ─────────────────────────────────────────────────────────────
  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }


  // ─────────────────────────────────────────────────────────────
/** Barcha foydalanuvchilarni olish — ADMIN uchun */
// ─────────────────────────────────────────────────────────────
async findAll(): Promise<User[]> {
  return this.userRepo.find();
}

  // ─────────────────────────────────────────────────────────────
  /** ID + refreshToken bilan topish — refresh rotation uchun */
  // ─────────────────────────────────────────────────────────────
  async findByIdWithRefreshToken(id: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.refreshToken')
      .where('user.id = :id', { id })
      .getOne();
  }

  // ─────────────────────────────────────────────────────────────
  /** Foydalanuvchi ma'lumotlarini yangilash (partial update) */
  // ─────────────────────────────────────────────────────────────
  async updateById(id: string, data: Partial<User>): Promise<void> {
    const result = await this.userRepo.update({ id }, data);
    if (result.affected === 0) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
  }

  // ─────────────────────────────────────────────────────────────
  /** OTP kodini va vaqtini saqlash */
  // ─────────────────────────────────────────────────────────────
  async saveOtp(id: string, otpCode: string): Promise<void> {
    await this.updateById(id, {
      otpCode,
      otpCreatedAt: new Date(),
    });
  }

  // ─────────────────────────────────────────────────────────────
  /** OTP ni tozalash — tasdiqlash yoki tiklashdan keyin */
  // ─────────────────────────────────────────────────────────────
  async clearOtp(id: string): Promise<void> {
    await this.updateById(id, {
      otpCode: null,
      otpCreatedAt: null,
    });
  }

  // ─────────────────────────────────────────────────────────────
  /** Hashed refresh tokenni saqlash yoki o'chirish (logout) */
  // ─────────────────────────────────────────────────────────────
  async saveRefreshToken(id: string, hashedToken: string | null): Promise<void> {
    await this.updateById(id, { refreshToken: hashedToken });
  }

  // ─────────────────────────────────────────────────────────────
  /** Email tasdiqlash flagini true ga o'zgartirish */
  // ─────────────────────────────────────────────────────────────
  async markEmailVerified(id: string): Promise<void> {
    await this.updateById(id, { isVerified: true });
  }

  // ─────────────────────────────────────────────────────────────
  /** Yangi parolni hash qilib saqlash */
  // ─────────────────────────────────────────────────────────────
  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.updateById(id, { password: hashedPassword });
  }
}