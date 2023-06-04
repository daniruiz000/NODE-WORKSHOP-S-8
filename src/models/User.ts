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

  validateFirstName(rawfirstName: string): void {
    const nameRegex = /^[A-Z][a-zA-Z]{2,19}$/;
    if (nameRegex.test(rawfirstName.trim())) {
      this.firstName = rawfirstName
    } else {
      throw new Error("El firstName no cumple con los requisitos.")
    }
  }

  validateLastName(rawlastName: string): void {
    const nameRegex = /^[A-Z][a-zA-Z]{2,19}$/;
    if (nameRegex.test(rawlastName.trim())) {
      this.lastName = rawlastName
    } else {
      throw new Error("El lastName no cumple con los requisitos.")
    }
  }

  setPassword(rawPassword: string): void {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{5,}$/;
    if (passwordRegex.test(rawPassword)) {
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      this.password = bcrypt.hashSync(rawPassword, salt);
    } else {
      throw new Error("La contraseña debe tener al menos 5 caracteres y contener un número")
    }
  }

  checkPassword(rawPassword: string): boolean {
    return bcrypt.compareSync(rawPassword, this.password);
  }

  validateEmail(rawEmail: string): void {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(rawEmail)) {
      this.email = rawEmail
    } else {
      throw new Error("Invalid email");
    }
  }

  validateDni(rawDni: string): void {
    const dniRegex = /^[0-9]{8}[a-zA-Z]$/;
    if (dniRegex.test(rawDni)) {
      this.dni = rawDni
    } else {
      throw new Error("Invalid DNI");
    }
  }
}
