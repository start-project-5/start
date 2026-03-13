import { UserRole } from 'src/common/enum/user-role.enum';
import { Booking } from 'src/modules/booking/entity/booking.entity';
import { Review } from 'src/modules/review/entity/review.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

/**
 * User — a registered tourist on the platform.
 *
 * One user can write many reviews and make many bookings.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  /** Indexed for fast lookups during login */
  @Index()
  @Column({ unique: true, length: 100 })
  email: string;

  /** Always store a hashed password — never plain text */
  @Column()
  password: string;

  @Column({ default: UserRole.TOURIST })
  role: UserRole;

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
