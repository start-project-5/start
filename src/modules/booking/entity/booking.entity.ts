import { User } from 'src/modules/auth/entity/auth.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * Booking — a tourist reserving a guide for one full day.
 *
 * Booking model: per day only (no hourly slots).
 * The date column stores the calendar date, e.g. "2024-08-15".
 *
 * Status lifecycle:
 *   pending → confirmed  (guide accepts)
 *   pending → cancelled  (tourist or guide cancels)
 */
@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The day of the tour.
   * TypeORM stores this as a DATE column (no time).
   * Example: "2024-08-15"
   */
  @Column({ type: 'date' })
  date: string;

  /**
   * Current state of the booking.
   * Possible values: "pending" | "confirmed" | "cancelled"
   */
  @Column({ default: 'pending' })
  status: string;

  // ── Relations ──────────────────────────────────────────────────────────

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Guide, (guide) => guide.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guide_id' })
  guide: Guide;

  @Column({ name: 'guide_id' })
  guideId: number;

  // ── Timestamps ─────────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;
}