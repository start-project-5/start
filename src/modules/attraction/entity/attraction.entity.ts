import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Attraction — a tourist landmark or point of interest in the city.
 * Examples: historical monuments, parks, viewpoints, squares.
 */
@Entity('attractions')
export class Attraction {
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

  // ── Timestamps ─────────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}