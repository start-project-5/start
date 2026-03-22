import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Restaurant } from 'src/modules/restaurant/entity/restaurant.entity';
import { MenuItemStatus } from 'src/common/enum/menuitem-status';
import { MenuCatalog } from 'src/modules/menu-catalog/entities/menu-catalog.entity';

@Entity('restaurant_menu_items')
@Unique(['catalog', 'restaurant']) // ← bitta restoranda bitta taom bir marta bo'lsin
export class RestaurantMenuItem extends BaseEntity {
  @Column({ type: 'varchar', length: 150, nullable: true,
    comment: 'null = katalog nomini ishlatadi' })
  customName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true,
    comment: 'null = katalog narxini ishlatadi' })
  customPrice: number;

  @Column({ type: 'text', nullable: true,
    comment: 'null = katalog rasmini ishlatadi' })
  customImage: string;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'enum', enum: MenuItemStatus, default: MenuItemStatus.AVAILABLE })
  status: MenuItemStatus;

  // ─── Relations ────────────────────────────────────────────────
  @ManyToOne(() => MenuCatalog, (catalog) => catalog.restaurantMenuItems, {
    onDelete: 'CASCADE',
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'catalog_id' })
  catalog: MenuCatalog;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuItems, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}

// import { MenuItemStatus } from "src/common/enum/menuitem-status";
// import { BaseEntity } from "src/database/base.entity";
// import { MenuCatalog } from "src/modules/menu-catalog/entities/menu-catalog.entity";
// import { Restaurant } from "src/modules/restaurant/entity/restaurant.entity";
// import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

// @Entity('restaurant_menu_items')
// export class RestaurantMenuItem extends BaseEntity {

//   // ─── Restoran o'zgartira oladigan fieldlar ────────────────────
//   @Column({ type: 'varchar', length: 150, nullable: true,
//     comment: 'null = katalog nomini ishlatadi' })
//   customName: string;

//   @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true,
//     comment: 'null = katalog narxini ishlatadi' })
//   customPrice: number;

//   @Column({ type: 'text', nullable: true,
//     comment: 'null = katalog rasmini ishlatadi' })
//   customImage: string;

//   @Column({ type: 'boolean', default: true })
//   isAvailable: boolean;

//   @Column({ type: 'enum', enum: MenuItemStatus, default: MenuItemStatus.AVAILABLE })
//   status: MenuItemStatus;

//   // ─── Relations ────────────────────────────────────────────────
//   @ManyToOne(() => MenuCatalog, (catalog) => catalog.restaurantMenuItems, {
//     onDelete: 'CASCADE',
//     nullable: false,
//     eager: true,   // ← catalog ma'lumotini avtomatik yuklaydi
//   })
//   @JoinColumn({ name: 'catalog_id' })
//   catalog: MenuCatalog;

//   @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuItems, {
//     onDelete: 'CASCADE',
//     nullable: false,
//   })
//   @JoinColumn({ name: 'restaurant_id' })
//   restaurant: Restaurant;
// }





















// import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
// import { BaseEntity } from 'src/database/base.entity';
// import { User } from 'src/modules/auth/user/user.entity';
// import { Restaurant } from 'src/modules/restaurant/entity/restaurant.entity';
// import { MenuCategory } from 'src/common/enum/menu-category';
// import { MenuItemStatus } from '../../../common/enum/menuitem-status';

// @Entity('menu_items')
// export class MenuItem extends BaseEntity {
//   // ─── Asosiy ma'lumotlar ───────────────────────────────────────

//   @Index({ fulltext: true })
//   @Column({ type: 'varchar', length: 150, comment: 'Taom nomi' })
//   name: string;

//   @Column({ type: 'text', nullable: true, comment: 'Taom tavsifi' })
//   description: string;

//   @Column({ type: 'text', nullable: true, comment: 'Taom rasmi' })
//   image: string;

//   // ─── Narx ─────────────────────────────────────────────────────

//   @Column({
//     type: 'decimal',
//     precision: 10,
//     scale: 2,
//     comment: "Narxi (so'mda)",
//   })
//   price: number;

//   @Column({
//     type: 'decimal',
//     precision: 10,
//     scale: 2,
//     nullable: true,
//     comment: 'Chegirmali narx (ixtiyoriy)',
//   })
//   discountPrice: number;

//   // ─── Kategoriya va holat ──────────────────────────────────────

//   @Column({
//     type: 'enum',
//     enum: MenuCategory,
//     default: MenuCategory.MAIN_COURSE,
//     comment: 'Taom kategoriyasi',
//   })
//   category: MenuCategory;

//   @Column({
//     type: 'enum',
//     enum: MenuItemStatus,
//     default: MenuItemStatus.AVAILABLE,
//     comment: 'Taom holati',
//   })
//   status: MenuItemStatus;

//   // ─── Qo'shimcha ma'lumotlar ───────────────────────────────────

//   @Column({
//     type: 'int',
//     nullable: true,
//     comment: 'Tayyorlash vaqti (daqiqada)',
//   })
//   preparationTime: number;

//   @Column({
//     type: 'int',
//     nullable: true,
//     comment: 'Kaloriya miqdori',
//   })
//   calories: number;

//   @Column({
//     type: 'simple-array',
//     nullable: true,
//     comment: 'Ingredientlar: ["go\'sht", "piyoz", "zira"]',
//   })
//   ingredients: string[];

//   @Column({
//     type: 'boolean',
//     default: false,
//     comment: 'Vegetarian taommi?',
//   })
//   isVegetarian: boolean;

//   @Column({
//     type: 'boolean',
//     default: false,
//     comment: 'Spicy (achchiqmi)?',
//   })
//   isSpicy: boolean;

//   @Index()
//   @Column({
//     type: 'decimal',
//     precision: 3,
//     scale: 1,
//     default: 0.0,
//     comment: 'Reyting (0.0 - 5.0)',
//   })
//   rating: number;

//   // ─── Relations ────────────────────────────────────────────────

//   @ManyToOne(() => User, (user) => user.menuItems, {
//     onDelete: 'CASCADE',
//     nullable: false,
//   })
//   @JoinColumn({ name: 'user_id' })
//   user: User;

//   @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuItems, {
//     onDelete: 'SET NULL',
//     nullable: true,
//   })
//   @JoinColumn({ name: 'restaurant_id' })
//   restaurant: Restaurant;
// }
