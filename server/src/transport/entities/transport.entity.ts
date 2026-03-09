import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Transport {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  phone: string;
}