import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Transport — a city transport hub directory entry.
 *
 * type stores the category as a plain string.
 * Expected values: "airport" | "train_station" | "bus_station"
 *
 * The index on type makes filtering by category fast:
 *   WHERE type = 'airport'
 */
@Entity('transports')
export class Transport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  /**
   * Category of this hub.
   * Examples: "airport", "train_station", "bus_station"
   */
  @Index()
  @Column({ length: 50 })
  type: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  // ── Timestamps ─────────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}