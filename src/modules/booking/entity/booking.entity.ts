import { Entity, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
// import { User } from 'src/modules/auth/user/entity/auth.entity';
import { Guide } from 'src/modules/guide/entity/guide.entity';
import { IsDateString, IsEnum, IsNumber, Min } from 'class-validator';
import { BookingStatus } from 'src/common/enum/booking-status.enum';
import { User } from 'src/modules/auth/user/user.entity';

@Entity('bookings')
@Unique(['guide', 'date']) // Senior darajadagi himoya: Bir gid bitta sanada faqat bir marta bron qilinishi mumkin
export class Booking extends BaseEntity {
  
  @Column({ type: 'date', comment: 'Bron qilingan kun (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
    comment: 'Bron holati'
  })
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, comment: 'Bron qilingan vaqtdagi narx' })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @Column({ type: 'text', nullable: true, comment: 'Turistning maxsus talablari' })
  notes: string;

  // ── Relations ──────────────────────────────────────────────────────────

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'RESTRICT' }) // Foydalanuvchi o'chsa ham bron tarixi qolishi kerak (Audit uchun)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' }) // UUID ishlatish tavsiya etiladi
  userId: string;

  @ManyToOne(() => Guide, (guide) => guide.bookings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'guide_id' })
  guide: Guide;

  @Column({ name: 'guide_id', type: 'uuid' })
  guideId: string;
}