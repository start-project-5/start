import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Museum } from './museum.entity';

@Entity('exhibits')
export class Exhibit extends BaseEntity {
  @Column({ type: 'varchar', length: 150, comment: 'Eksponat nomi' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: 'Tavsif' })
  description: string;

  @Column({ type: 'varchar', nullable: true, comment: 'Rasm fayli' })
  image: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Davr: Bronza asri, XVIII asr...',
  })
  period: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // ─── RELATION ────────────────────────────────────────────────

  @ManyToOne(() => Museum, (museum) => museum.exhibits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'museum_id' })
  museum: Museum;
}

// import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
// import { BaseEntity } from 'src/database/base.entity';
// import { Museum } from './museum.entity';

// @Entity('exhibits')
// export class Exhibit extends BaseEntity {

//   @Column({ type: 'varchar', length: 150 })
//   name: string;

//   @Column({ type: 'text', nullable: true })
//   description: string;

//   @Column({ type: 'varchar', nullable: true })
//   image: string;

//   @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Davr: Bronza asri...' })
//   period: string;

//   @Column({ type: 'boolean', default: true })
//   isActive: boolean;

//   @ManyToOne(() => Museum, (museum) => museum.exhibits, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'museum_id' })
//   museum: Museum;
// }