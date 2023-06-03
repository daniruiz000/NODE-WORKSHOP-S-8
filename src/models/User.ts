import bcrypt from "bcrypt";
import {
  Entity, // Para hacer entidades
  PrimaryGeneratedColumn, // Para crear una columna id y autogenerada
  Column, // Para crear columnas
  OneToMany,
} from "typeorm"

import { Booking } from "./Booking"

export enum treatmentEnum {
  SR = "Sr.",
  SRA = "Sra.",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    firstName: string

  @Column()
    lastName: string

  @Column()
    password: string;

  setPassword(rawPassword: string): void {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    this.password = bcrypt.hashSync(rawPassword, salt);
  }

  checkPassword(rawPassword: string): boolean {
    return bcrypt.compareSync(rawPassword, this.password);
  }

  @Column({ unique: true })
    email: string

  @Column()
    dni: string

  @Column()
    nacionality: string

  @Column()
    birth_date: string

  @Column()
    treatment: treatmentEnum

  @OneToMany(type => Booking, booking => booking.user, { cascade: true })
    bookings: Booking[];
}
