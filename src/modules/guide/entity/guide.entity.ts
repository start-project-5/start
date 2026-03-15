import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Booking } from 'src/modules/booking/entity/booking.entity';
import { Review } from 'src/modules/review/entity/review.entity';
import { IsNotEmpty, IsString, IsArray, IsEnum, Min, Max, IsNumber, IsOptional } from 'class-validator';

// Kunlar uchun enum - xatolikni oldini oladi
export enum WeekDay {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday'
}

@Entity('guides')
export class Guide extends BaseEntity {
  @Column({ type: 'varchar', length: 100, comment: 'Gidning toliq ismi' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column({ type: 'date', comment: 'Tugilgan sanasi (yoshni hisoblash uchun)' })
  birthDate: Date;

  @Column({ type: 'int', default: 0, comment: 'Tajriba yillari' })
  @Min(0)
  yearsOfExperience: number;

  @Column({ type: 'text', comment: 'Gid haqida qisqacha malumot' })
  bio: string;

  @Column({ 
    type: 'jsonb', 
    default: [], 
    comment: 'Gaplasha oladigan tillari (Array formatida)' 
  })
  @IsArray()
  languages: string[];

  @Column({ type: 'decimal', nullable: true, precision: 12, scale: 2, comment: 'Bir kunlik xizmat haqi' })
  @IsNumber()
  @Min(0)
  dailyRate: number;

  @Column({ type: 'text', nullable: true, comment: 'Profil rasmi URL' })
  photo: string;

  @Index()
  @Column({ 
    type: 'decimal', 
    precision: 3, 
    scale: 2, 
    default: 0.0,
    comment: 'Ortacha reyting (0.00 dan 5.00 gacha)' 
  })
  rating: number;

  @Column({ 
    type: 'enum', 
    enum: WeekDay, 
    array: true, 
    default: [],
    comment: 'Ish kunlari' 
  })
  availableDays: WeekDay[];

  @Column({ type: 'boolean', default: true, comment: 'Gid faolmi yoki tahrirda?' })
  isActive: boolean;

  // ── Relations ──────────────────────────────────────────────────────────

  @OneToMany(() => Review, (review) => review.guide)
  reviews: Review[];

  @OneToMany(() => Booking, (booking) => booking.guide)
  bookings: Booking[];

  // ── Virtual Property ──────────────────────────────────────────────────
  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }
}

// import { BaseEntity } from 'src/database/base.entity';
// import { Booking } from 'src/modules/booking/entity/booking.entity';
// import { Review } from 'src/modules/review/entity/review.entity';
// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   OneToMany,
//   Index,
// } from 'typeorm';

// /**
//  * Guide — a local city guide that tourists can book.
//  *
//  * Guides work FULL DAYS only (no hourly slots).
//  * availableDays stores which days of the week they work.
//  *
//  * Example:
//  *   availableDays = ["monday", "wednesday", "friday"]
//  */

// @Entity('guides')
// export class Guide extends BaseEntity {
//   @Column({ length: 100 })
//   name: string;

//   @Column()
//   age: number;

//   @Column({ name: 'years_of_experience' })
//   yearsOfExperience: number;

//   /** Short biography shown on the guide's profile page */
//   @Column({ type: 'text' })
//   bio: string;

//   /**
//    * Languages the guide speaks.
//    * Stored as a comma-separated string by simple-array.
//    * Example stored value: "English,French,Uzbek"
//    */
//   @Column({ type: 'simple-array' })
//   languages: string[];

//   @Column({ nullable: true })
//   photo: string;

//   /** Average rating (0.0 – 5.0). Indexed for fast ORDER BY / filter queries. */
//   @Index()
//   @Column({ type: 'decimal', precision: 3, scale: 1, default: 0.0 })
//   rating: number;

//   /**
//    * Days the guide is available for bookings.
//    * Example: ["monday", "tuesday", "friday"]
//    */
//   @Column({ type: 'simple-array', name: 'available_days' })
//   availableDays: string[];

//   // ── Relations ──────────────────────────────────────────────────────────

//   @OneToMany(() => Review, (review) => review.guide)
//   reviews: Review[];

//   @OneToMany(() => Booking, (booking) => booking.guide)
//   bookings: Booking[];

//   // ── Timestamps ─────────────────────────────────────────────────────────
// }