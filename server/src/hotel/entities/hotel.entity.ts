import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Hotel {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @Column()
  rating: number;
}