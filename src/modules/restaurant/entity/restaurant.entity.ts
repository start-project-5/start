import {
  Entity,
  Column,
  Index,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsOptional,
  IsLatitude,
  IsLongitude,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { PriceRange } from 'src/common/enum/restaurant_price.enum';
import { WorkingHoursDto } from '../dto/workingHours.dto';
import { User } from 'src/modules/auth/user/user.entity';

@Entity('restaurants')
export class Restaurant extends BaseEntity {
  @Index({ fulltext: true })
  @Column({ type: 'varchar', length: 150, comment: 'Restoran nomi' })
  @IsNotEmpty()
  name: string;

  @Column({
    type: 'text',
    comment: 'Restoran tavsifi va menyu haqida qisqacha',
  })
  @IsNotEmpty()
  description: string;

  @Column({
    type: 'enum',
    enum: PriceRange,
    default: PriceRange.MODERATE,
    comment: 'Narx toifasi',
  })
  @IsEnum(PriceRange)
  priceRange: PriceRange;

  @Column({ type: 'varchar', length: 255, comment: 'Aniq manzil' })
  address: string;

  // Geolokatsiya uchun Index qo'shish qidiruvni tezlashtiradi
  @Index()
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  @IsOptional()
  @IsLatitude()
  latitude: string;

  @Index()
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  @IsOptional()
  @IsLongitude()
  longitude: string;

  @Column({ type: 'text', nullable: true, comment: 'Asosiy rasm' })
  @IsOptional()
  @IsUrl()
  image: string;

  @Index()
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 1,
    default: 0.0,
    comment: 'Reyting (0.0 - 5.0)',
  })
  @Min(0)
  @Max(5)
  rating: number;

  // @Column({ type: 'varchar', nullable: true, comment: 'joylar soni' })
  // reviewsCount: string;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Bron qilish imkoniyati bormi?',
  })
  isBookingAvailable: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Ish vaqti: {"monday": "09:00-22:00", "sunday": "yopiq"}',
  })
  workingHours: object; // 'object' o'rniga aniq klass nomi

  // -----------------------relation

  @ManyToOne(() => User, (user) => user.restaurants, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
