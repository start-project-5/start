import { Column, Entity, JoinColumn, OneToOne, Index } from "typeorm";
import { BaseEntity } from "src/database/base.entity";
import { IsOptional, IsString, IsUrl, IsNumber, IsLatitude, IsLongitude } from "class-validator";
import { Expose } from "class-transformer";
import { User } from "src/modules/auth/user/user.entity";

@Entity({ name: "profiles" }) // Ko'plikda nomlash DB standartlariga yaqinroq
export class Profile extends BaseEntity {
  
  @Column({ type: "varchar", length: 100, nullable: true })
  @IsOptional()
  @IsString()
  firstName: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  @IsOptional()
  @IsString()
  lastName: string;

  @Column({ type: "text", nullable: true })
  @IsOptional()
  @IsUrl()
  avatarUrl: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  @IsOptional()
  locationName: string; // 'from' o'rniga aniqroq nom

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

  @Column({ type: "text", nullable: true })
  @IsOptional()
  resumeUrl: string;

  @OneToOne(() => User, (user) => user.profile, { 
    onDelete: "CASCADE",
    onUpdate: "CASCADE" 
  })
  @JoinColumn({ name: "user_id" }) // Foreign key nomini aniq ko'rsatish
  user: User;

  // Virtual property (Senior uslubi)
  @Expose()
  get fullName(): string {
    return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
  }
}
