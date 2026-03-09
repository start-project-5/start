import { User } from "src/auth/entities/auth.entity";
import { Guide } from "src/guide/entities/guide.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";

@Entity()
export class Review {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rating: number;

  @Column()
  comment: string;

  @ManyToOne(() => User, user => user.reviews)
  user: User;

  @ManyToOne(() => Guide, guide => guide.reviews)
  guide: Guide;
}