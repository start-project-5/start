import { UserRole } from 'src/common/enum/user-role.enum';
import { BaseEntity } from 'src/database/base.entity';
import { Booking } from 'src/modules/booking/entity/booking.entity';
import { Profile } from 'src/modules/profile/entities/profile.entity';
import { Restaurant } from 'src/modules/restaurant/entity/restaurant.entity';
import { Review } from 'src/modules/review/entity/review.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  OneToOne,
} from 'typeorm';

/**
 * User — a registered tourist on the platform.
 *
 * One user can write many reviews and make many bookings.
 */
@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 50, unique: true, nullable: true })
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

  // Profile bilan bog'liqlik saqlanib qoladi
  // @OneToOne(() => Profile, (profile) => profile.user, { cascade: true, onDelete: "CASCADE" })
  // profile: Profile;

  // User Entity ichida
  // @OneToMany(() => Restaurant, (restaurant) => restaurant.user, {cascade: true})
  // restaurants: Restaurant[];
}
