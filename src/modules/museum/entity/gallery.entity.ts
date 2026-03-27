import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Museum } from './museum.entity';

@Entity('galleries')
export class Gallery extends BaseEntity {
  @Column({ type: 'varchar', comment: 'Rasm fayli' })
  imageUrl: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'Rasm tavsifi',
  })
  caption: string;

  @Column({ type: 'int', default: 0, comment: 'Tartib raqami' })
  order: number;

  // ─── RELATION ────────────────────────────────────────────────

  @ManyToOne(() => Museum, (museum) => museum.galleries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'museum_id' })
  museum: Museum;
}

// import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
// import { BaseEntity } from 'src/database/base.entity';
// import { Museum } from './museum.entity';

// @Entity('galleries')
// export class Gallery extends BaseEntity {

//   @Column({ type: 'varchar' })
//   imageUrl: string;

//   @Column({ type: 'varchar', length: 200, nullable: true })
//   caption: string;

//   @Column({ type: 'int', default: 0, comment: 'Tartib raqami' })
//   order: number;

//   @ManyToOne(() => Museum, (museum) => museum.galleries, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'museum_id' })
//   museum: Museum;
// }