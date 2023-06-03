import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Travel } from "./Travel";

export enum Type {
  AVE,
  AVLO,
  AVANT,
  RENFE
}

@Entity()
export class Train {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    licencePlate: string;

  @Column()
    capacity: number;

  @Column()
    type: Type;

  @OneToMany(type => Travel, travel => travel.train, { cascade: true })
    travels: Travel[];
}
