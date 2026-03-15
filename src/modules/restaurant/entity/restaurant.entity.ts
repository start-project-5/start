import { BaseEntity } from 'src/database/base.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Restaurant — a dining place in the city.
 *
 * This platform serves one city only, so there is no city relation.
 * Location is stored directly as address + coordinates.
 */
@Entity('restaurants')
export class Restaurant extends BaseEntity {
  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 255 })
  address: string;

  /** GPS latitude — e.g. 41.299496 */
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  /** GPS longitude — e.g. 69.240073 */
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  image: string;

  @Index()
  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0.0 })
  rating: number;

  // ── Timestamps ─────────────────────────────────────────────────────────
}