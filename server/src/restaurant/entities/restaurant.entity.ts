import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Restaurant {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  cuisine: string;

  @Column()
  address: string;

  @Column()
  image: string;

  @Column()
  rating: number;
}