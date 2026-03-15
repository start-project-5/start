import { BaseEntity } from 'src/database/base.entity';
import { User } from 'src/modules/auth/entity/auth.entity';
import { Guide } from 'src/modules/guide/entity/guide.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * Review — a tourist's rating and comment for a guide.
 *
 * Many reviews → one user  (the tourist who wrote it)
 * Many reviews → one guide (the guide being reviewed)
 */
@Entity('reviews')
export class Review extends BaseEntity {
  /** Score between 1 (worst) and 5 (best) */
  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  // ── Relations ──────────────────────────────────────────────────────────

  /**
   * @ManyToOne  → many reviews can belong to one user
   * @JoinColumn → names the FK column in the DB: user_id
   * onDelete: CASCADE → if the user is deleted, their reviews are too
   */
  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Guide, (guide) => guide.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guide_id' })
  guide: Guide;

  @Column({ name: 'guide_id' })
  guideId: number;

  // ── Timestamps ─────────────────────────────────────────────────────────
}