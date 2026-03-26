import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Museum } from './museum.entity';
import { User } from 'src/modules/auth/user/user.entity';

@Entity('museum_reviews')
export class Reviews extends BaseEntity {
  @Column({ type: 'int', comment: '1 dan 5 gacha' })
  rating: number;

  @Column({ type: 'text', nullable: true, comment: 'Izoh' })
  comment: string;

  // ─── RELATIONS ───────────────────────────────────────────────

  @ManyToOne(() => Museum, (museum) => museum.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'museum_id' })
  museum: Museum;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

// import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
// import { BaseEntity } from 'src/database/base.entity';
// import { Museum } from './museum.entity';
// import { User } from 'src/modules/auth/user/user.entity';

// @Entity('museum_reviews')
// export class Reviews extends BaseEntity {

//   @Column({ type: 'int', comment: '1 dan 5 gacha' })
//   rating: number;

//   @Column({ type: 'text', nullable: true })
//   comment: string;

//   @ManyToOne(() => Museum, (museum) => museum.reviews, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'museum_id' })
//   museum: Museum;

//   @ManyToOne(() => User, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'user_id' })
//   user: User;
// }