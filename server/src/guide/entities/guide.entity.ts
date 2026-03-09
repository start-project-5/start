import { Booking } from "src/booking/entities/booking.entity";
import { Review } from "src/review/entities/review.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

@Entity()
export class Guide {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  experience: number;

  @Column("text", { array: true })
  languages: string[];

  @Column()
  bio: string;

  @Column()
  rating: number;

  @Column()
  photo: string;

  @OneToMany(() => Review, review => review.guide)
  reviews: Review[];

  @OneToMany(() => Booking, booking => booking.guide)
  bookings: Booking[];
}