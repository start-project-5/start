import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  Max,
  Min,
  IsOptional,
  MaxLength,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { User } from 'src/modules/auth/user/user.entity';

// Decimalni stringdan numberga o'tkazish uchun transformer
export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number {
    return parseFloat(data);
  }
}

@Entity('hotels')
export class Hotel extends BaseEntity {
  @Index({ fulltext: true })
  @Column({ type: 'varchar', length: 150, comment: 'Mehmonxona nomi' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string;

  @Column({ type: 'text', comment: 'Batafsil tavsif' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Mehmonxonaning aniq manzili',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
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

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Asosiy preview rasm URL manzili',
  })
  @IsOptional()
  @IsUrl()
  image: string;

  @Index()
  @Column({
    type: 'decimal',
    precision: 2, // Faqat 2 ta raqam (masalan, 4.5 yoki 5.0)
    scale: 1,
    default: 0.0,
    transformer: new ColumnNumericTransformer(),
    comment: 'O`rtacha reyting (0.0 dan 5.0 gacha)',
  })
  @Min(0)
  @Max(5)
  rating: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Mehmonxonaning yulduzlar soni (1-5)',
  })
  @Min(0)
  @Max(5)
  stars: number;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Hozirda band qilish uchun ochiqmi?',
  })
  isAvailable: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Ish vaqti: {"monday": "09:00-22:00", "sunday": "yopiq"}',
  })
  retseptionTime: object; // 'object' o'rniga aniq klass nomi

  // Keyinchalik qo'shish uchun tavsiya:
  @ManyToOne(() => User, (user) => user.hotels, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
