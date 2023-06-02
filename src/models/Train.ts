import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Travel } from "./Travel";

enum Type {
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

  @OneToMany(type => Travel, travel => Travel.travel)
    travels: Travel[];
}