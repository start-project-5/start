import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Review }  from '../../reviews/entities/review.entity';
import { Booking } from '../../bookings/entities/booking.entity';

/**
 * User — a registered tourist on the platform.
 *
 * One user can write many reviews and make many bookings.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  /** Indexed for fast lookups during login */
  @Index()
  @Column({ unique: true, length: 150 })
  email: string;

  /** Always store a hashed password — never plain text */
  @Column()
  password: string;

  // ── Relations ──────────────────────────────────────────────────────────

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  // ── Timestamps ─────────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}