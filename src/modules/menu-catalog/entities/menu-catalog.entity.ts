import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { User } from 'src/modules/auth/user/user.entity';
import { MenuCategory } from 'src/common/enum/menu-category';
import { RestaurantMenuItem } from 'src/modules/menu-item/entities/menu-item.entity';

@Entity('menu_catalog')
export class MenuCatalog extends BaseEntity {
  @Index({ fulltext: true })
  @Column({ type: 'varchar', length: 150, comment: 'Taom nomi' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: 'Taom tavsifi' })
  description: string;

  @Column({ type: 'text', nullable: true, comment: 'Taom rasmi' })
  image: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: "Narxi (so'mda)" })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountPrice: number;

  @Column({ type: 'enum', enum: MenuCategory, default: MenuCategory.MAIN_COURSE })
  category: MenuCategory;

  @Column({ type: 'int', nullable: true, comment: 'Tayyorlash vaqti (daqiqa)' })
  preparationTime: number;

  @Column({ type: 'int', nullable: true, comment: 'Kaloriya' })
  calories: number;

  @Column({ type: 'simple-array', nullable: true })
  ingredients: string[];

  @Column({ type: 'boolean', default: false })
  isVegetarian: boolean;

  @Column({ type: 'boolean', default: false })
  isSpicy: boolean;

  // ─── Relations ────────────────────────────────────────────────
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => RestaurantMenuItem, (rm) => rm.catalog)
  restaurantMenuItems: RestaurantMenuItem[];
}

// import { MenuCategory } from "src/common/enum/menu-category";
// import { BaseEntity } from "src/database/base.entity";
// import { User } from "src/modules/auth/user/user.entity";
// import { RestaurantMenuItem } from "src/modules/menu-item/entities/menu-item.entity";
// import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

// @Entity('menu_catalog')
// export class MenuCatalog extends BaseEntity {
//   @Column({ type: 'varchar', length: 150 })
//   name: string;

//   @Column({ type: 'text', nullable: true })
//   description: string;

//   @Column({ type: 'text', nullable: true })
//   image: string;

//   @Column({ type: 'decimal', precision: 10, scale: 2 })
//   price: number;

//   @Column({ type: 'enum', enum: MenuCategory, default: MenuCategory.MAIN_COURSE })
//   category: MenuCategory;

//   @Column({ type: 'int', nullable: true })
//   calories: number;

//   @Column({ type: 'simple-array', nullable: true })
//   ingredients: string[];

//   @Column({ type: 'boolean', default: false })
//   isVegetarian: boolean;

//   @Column({ type: 'boolean', default: false })
//   isSpicy: boolean;

//   // ─── Relations ────────────────────────────
//   @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
//   @JoinColumn({ name: 'user_id' })
//   user: User;

//   @OneToMany(() => RestaurantMenuItem, (rm) => rm.catalog)
//   restaurantMenuItems: RestaurantMenuItem[];
// }