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
  toObject(): any {
    throw new Error("Method not implemented.")
  }

  @PrimaryGeneratedColumn()
    id: number

  @Column()
    firstName: string

  @Column()
    lastName: string

  @Column({ select: false })
    password: string

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
