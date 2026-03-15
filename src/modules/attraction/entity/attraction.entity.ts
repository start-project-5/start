import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { IsNotEmpty, IsString, IsUrl, IsOptional, MaxLength, IsLatitude, IsLongitude } from 'class-validator';

@Entity('attractions')
export class Attraction extends BaseEntity {

  @Index({ fulltext: true })
  @Column({ type: 'varchar', length: 150, comment: 'Joyning nomi' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 180, comment: 'SEO uchun slug' })
  slug: string;

  @Column({ type: 'text', nullable: true, comment: 'Batafsil tavsif' })
  @IsString()
  description: string;

  @Column({ type: 'varchar', length: 255, comment: 'Fizik manzil' })
  @IsNotEmpty()
  @IsString()
  address: string;

  // Xaritada ko'rsatish va masofani hisoblash uchun
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true, comment: 'Kenglik (Latitude)' })
  @IsLatitude()
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true, comment: 'Uzunlik (Longitude)' })
  @IsLongitude()
  longitude: number;

  @Column({ type: 'text', nullable: true, comment: 'Asosiy rasm URL' })
  @IsOptional()
  @IsUrl()
  image: string;

  @Column({ type: 'int', default: 0, comment: 'Joyning ko`rilganlar soni' })
  viewsCount: number;

  @Column({ type: 'boolean', default: true, comment: 'Hozirda tashrif buyuruvchilar uchun ochiqmi?' })
  isPublic: boolean;
}