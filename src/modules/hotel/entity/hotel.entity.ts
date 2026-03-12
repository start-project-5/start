import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Hotel — accommodation options for tourists visiting the city.
 */
@Entity('hotels')
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 255 })
  address: string;

  @Column({ nullable: true })
  image: string;

  @Index()
  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0.0 })
  rating: number;

  // ── Timestamps ─────────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}