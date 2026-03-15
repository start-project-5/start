import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Event — a time-bound city event (concert, festival, exhibition, etc.)
 *
 * The date index speeds up queries for upcoming events:
 *   WHERE date >= NOW() ORDER BY date ASC
 */
@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  /** Venue name or address */
  @Column({ length: 255 })
  location: string;

  /** Event start date/time */
  @Index()
  @Column({ type: 'timestamptz' })
  date: Date;

  /** Person or company running the event */
  // auth bilan relation atamiz 
  @Column({ length: 150 })
  organizer: string;

  // ── Timestamps ─────────────────────────────────────────────────────────

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}