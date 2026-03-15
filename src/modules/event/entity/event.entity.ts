import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { IsNotEmpty, IsString, IsDate, IsEnum, IsOptional, MaxLength, IsLatitude, IsLongitude } from 'class-validator';
import { EventStatus } from 'src/common/enum/eventSatatus.enum';

@Entity('events')
export class Event extends BaseEntity {

  @Column({ type: 'varchar', length: 200, comment: 'Tadbir nomi' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @Index({ unique: true }) // SEO va chiroyli URL uchun
  @Column({ type: 'varchar', length: 255, comment: 'URL slug (masalan: festival-2026)' })
  slug: string;

  @Column({ type: 'text', comment: 'Tadbir haqida batafsil malumot' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @Column({ type: 'varchar', length: 255, comment: 'Otqazilish joyi (Venue)' })
  @IsNotEmpty()
  @IsString()
  location: string;
  
  // Geolokatsiya uchun Index qo'shish qidiruvni tezlashtiradi
  @Index()
  @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
  @IsOptional()
  @IsLatitude()
  latitude: string;
  
  @Index()
  @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
  @IsOptional()
  @IsLongitude()
  longitude: string;
  
  @Index()
  @Column({ type: 'timestamptz', comment: 'Boshlanish vaqti' })
  @IsDate()
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true, comment: 'Tugash vaqti' })
  @IsOptional()
  @IsDate()
  endDate: Date;

  @Column({ 
    type: 'enum', 
    enum: EventStatus, 
    default: EventStatus.DRAFT,
    comment: 'Tadbir holati' 
  })
  @IsEnum(EventStatus)
  status: EventStatus;

  @Column({ type: 'varchar', length: 150, comment: 'Tashkilotchi nomi' })
  @IsNotEmpty()
  organizer: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, comment: 'Kirish narxi (0 bolsa bepul)' })
  price: number;

  @Column({ type: 'int', default: 0, comment: 'Maksimal qatnashchilar soni' })
  capacity: number;
}