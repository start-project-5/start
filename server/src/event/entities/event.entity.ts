import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Event {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  location: string;

  @Column()
  date: Date;

  @Column()
  description: string;

  @Column()
  image: string;
}