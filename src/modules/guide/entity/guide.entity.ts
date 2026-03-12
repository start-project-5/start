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
 * Guide — a local city guide that tourists can book.
 *
 * Guides work FULL DAYS only (no hourly slots).
 * availableDays stores which days of the week they work.
 *
 * Example:
 *   availableDays = ["monday", "wednesday", "friday"]
 */
@Entity('guides')
export class Guide {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column()
  age: number;

  @Column({ name: 'years_of_experience' })
  yearsOfExperience: number;

  /** Short biography shown on the guide's profile page */
  @Column({ type: 'text' })
  bio: string;

  /**
   * Languages the guide speaks.
   * Stored as a comma-separated string by simple-array.
   * Example stored value: "English,French,Uzbek"
   */
  @Column({ type: 'simple-array' })
  languages: string[];

  @Column({ nullable: true })
  photo: string;

  /** Average rating (0.0 – 5.0). Indexed for fast ORDER BY / filter queries. */
  @Index()
  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0.0 })
  rating: number;

  /**
   * Days the guide is available for bookings.
   * Example: ["monday", "tuesday", "friday"]
   */
  @Column({ type: 'simple-array', name: 'available_days' })
  availableDays: string[];

  // ── Relations ──────────────────────────────────────────────────────────

  @OneToMany(() => Review, (review) => review.guide)
  reviews: Review[];

  @OneToMany(() => Booking, (booking) => booking.guide)
  bookings: Booking[];

  // ── Timestamps ─────────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}