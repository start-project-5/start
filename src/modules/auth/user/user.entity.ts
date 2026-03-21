// src/modules/auth/user/user.entity.ts
import { UserRole } from 'src/common/enum/user-role.enum';
import { BaseEntity } from 'src/database/base.entity';
import { Booking } from 'src/modules/booking/entity/booking.entity';
import { Hotel } from 'src/modules/hotel/entity/hotel.entity';
import { Profile } from 'src/modules/profile/entities/profile.entity';
import { Restaurant } from 'src/modules/restaurant/entity/restaurant.entity';
import { Review } from 'src/modules/review/entity/review.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
// import { BaseEntity } from '../../../database/base.entity';
// import { Role } from '../../../common/enums/role.enum';
// import { Review } from '../../review/entities/review.entity';
// import { Booking } from '../../booking/entities/booking.entity';

@Entity('users')
export class User extends BaseEntity {
  // ─── MAVJUD FIELDS (o'zgarishsiz) ───────────────────────────

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;



  /** Bcrypt bilan hash qilingan parol — select:false (query da avtomatik chiqmaydi) */
  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.TOURIST })
  role: UserRole;

  // ─── YANGI FIELDS ────────────────────────────────────────────

  /** Foydalanuvchi emailini OTP orqali tasdiqlaganmi */
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  /** Hisob aktiv yoki admin tomonidan bloklangan */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /** Bir martalik parol kodi — email tasdiqlash va parol tiklash uchun */
  @Column({ type: 'varchar', nullable: true, default: null })
  otpCode: string | null;

  /** OTP yaratilgan vaqt — muddati o'tganligini aniqlash uchun */
  @Column({ type: 'timestamp', nullable: true, default: null })
  otpCreatedAt: Date | null;

  /** Refresh token — bcrypt hash saqlanadi, query da chiqmaydi */
  @Column({ type: 'varchar', nullable: true, default: null, select: false })
  refreshToken: string | null;

  /** GUIDE va BUSINESS_OWNER rollari uchun admin tasdig'i */
  @Column({ type: 'boolean', default: false })
  isApprovedByAdmin: boolean;

  // ─── MAVJUD RELATIONS (o'zgarishsiz) ─────────────────────────

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];
  
  // User Entity ichida
  @OneToMany(() => Restaurant, (restaurant) => restaurant.user, {cascade: true})
  restaurants: Restaurant[];
  
  @OneToMany(() => Hotel, (hotel) => hotel.user, {cascade: true})
  hotels: Hotel[];
}