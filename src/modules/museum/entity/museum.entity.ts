import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { User } from 'src/modules/auth/user/user.entity';
import { Exhibit } from './exhibit.entity';
import { Gallery } from './gallery.entity';
import { Reviews } from './review.entity';
import { Favorite } from './favorite.entity';

@Entity('museums')
export class Museum extends BaseEntity {
  @Index({ fulltext: true })
  @Column({ type: 'varchar', length: 150, comment: 'Muzey nomi' })
  name: string;

  @Column({ type: 'text', comment: 'Batafsil tavsif' })
  description: string;

  @Column({ type: 'varchar', length: 500, comment: 'Fizik manzil' })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Shahar' })
  city: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: "Kategoriya: Tarix, San'at...",
  })
  category: string;

  @Index()
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: string;

  @Index()
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: string;

  @Column({ type: 'text', nullable: true, comment: 'Asosiy rasm fayli' })
  image: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: "Kirish narxi (so'mda)",
  })
  ticketPrice: number;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '{"monday": "09:00-18:00", "sunday": "yopiq"}',
  })
  workingHours: object;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    comment: "O'rtacha reyting 0-5",
  })
  averageRating: number;

  @Column({ type: 'int', default: 0, comment: 'Jami review soni' })
  reviewCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // ─── RELATIONS ───────────────────────────────────────────────

  @ManyToOne(() => User, (user) => user.museums, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Exhibit, (exhibit) => exhibit.museum, { cascade: true })
  exhibits: Exhibit[];

  @OneToMany(() => Gallery, (gallery) => gallery.museum, { cascade: true })
  galleries: Gallery[];

  @OneToMany(() => Reviews, (review) => review.museum, { cascade: true })
  reviews: Reviews[];

  @OneToMany(() => Favorite, (favorite) => favorite.museum, { cascade: true })
  favorites: Favorite[];
}

// import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
// import { BaseEntity } from 'src/database/base.entity';
// import { User } from 'src/modules/auth/user/user.entity';
// import { Exhibit } from './exhibit.entity';
// import { Gallery } from './gallery.entity';
// import { Reviews } from './review.entity';
// import { Favorite } from './favorite.entity';

// @Entity('museums')
// export class Museum extends BaseEntity {

//   @Index({ fulltext: true })
//   @Column({ type: 'varchar', length: 150, comment: 'Muzey nomi' })
//   name: string;

//   @Column({ type: 'text', comment: 'Batafsil tavsif' })
//   description: string;

//   @Column({ type: 'varchar', length: 500, comment: 'Fizik manzil' })
//   address: string;

//   @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Shahar' })
//   city: string;

//   @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Kategoriya: Tarix, Sanʼat...' })
//   category: string;

//   @Index()
//   @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
//   latitude: string;

//   @Index()
//   @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
//   longitude: string;

//   @Column({ type: 'text', nullable: true, comment: 'Asosiy rasm fayli' })
//   image: string;

//   @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Kirish narxi' })
//   ticketPrice: number;

//   @Column({
//     type: 'jsonb',
//     nullable: true,
//     comment: '{"monday": "09:00-18:00", "sunday": "yopiq"}',
//   })
//   workingHours: object;

//   @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
//   averageRating: number;

//   @Column({ type: 'int', default: 0 })
//   reviewCount: number;

//   @Column({ type: 'boolean', default: true })
//   isActive: boolean;

//   @ManyToOne(() => User, (user) => user.museums, {
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE',
//   })
//   @JoinColumn({ name: 'user_id' })
//   user: User;

//   @OneToMany(() => Exhibit, (exhibit) => exhibit.museum)
//   exhibits: Exhibit[];

//   @OneToMany(() => Gallery, (gallery) => gallery.museum)
//   galleries: Gallery[];

//   @OneToMany(() => Reviews, (review) => review.museum)
//   reviews: Reviews[];

//   @OneToMany(() => Favorite, (favorite) => favorite.museum)
//   favorites: Favorite[];
// }