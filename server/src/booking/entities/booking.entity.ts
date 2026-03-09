import { User } from "src/auth/entities/auth.entity";
import { Guide } from "src/guide/entities/guide.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";

@Entity()
export class Booking {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  status: string;

  @ManyToOne(() => User, user => user.bookings)
  user: User;

  @ManyToOne(() => Guide, guide => guide.bookings)
  guide: Guide;
}