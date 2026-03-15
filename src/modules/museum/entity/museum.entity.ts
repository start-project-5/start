import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Museum — museums and cultural institutions in the city.
 */
@Entity('museums')
export class Museum {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  // @Column()
  // workingTime: string; 08:00-20:00

  //   @Column()
  // workingDay: string; // Monday - Friday

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
