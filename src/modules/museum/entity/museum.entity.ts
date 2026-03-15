import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { BaseEntity } from 'src/database/base.entity';
import { Entity, Column, Index } from 'typeorm';

@Entity('museums')
export class Museum extends BaseEntity {
  @Index({ fulltext: true }) //Qidiruvni tezlashtirish uchun
  @Column({ type: 'varchar', length: 150, comment: "Muzeyning to'liq nomi" })
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Muzey haqida batafsil malimot',
  })
  @IsOptional()
  @IsString()
  description: string;

  @Column({ type: 'varchar', length: 500, comment: 'Fizik manzili' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  address: string;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'Asosiy rasm URL manzili',
  })
  @IsOptional()
  @IsUrl({}, { message: "Rasm formati xato (URL bo'lishi kerak)" })
  image: string;

  // Seniorlar odatda bazaga xarita koordinatalarini ham qoshishadi
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: string;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: string;
}
