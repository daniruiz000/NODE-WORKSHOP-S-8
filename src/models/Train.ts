import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Travel } from "./Travel";

export enum typeEnum {
  AVE = "AVE",
  AVLO = "AVLO",
  AVANT = "AVANT",
  RENFE = "RENFE"
}

export enum sectionEnum {
  NORMAL = "NORMAL",
  BUSINESS = "BUSINESS",
  VIP = "VIP"
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
    type: typeEnum;

  @Column()
    section: sectionEnum;

  @OneToMany(type => Travel, travel => travel.train, { cascade: true })
    travels: Travel[];

  validateCapacity(rawCapacity: number): void {
    if (this.capacity < 1) {
      throw new Error("El tren debe tener al menos 1 asiento de capacidad");
    } else {
      this.capacity = rawCapacity
    }
  }

  validateLicencePlate(rawLincencePlate: string): void {
    const licencePlateRegex = /^(?=.*[A-Z])(?=.*\d)[A-Z\d]{6}$/;
    if (!licencePlateRegex.test(rawLincencePlate)) {
      throw new Error("Licence plate must have three uppercase letters and three numbers in any order.");
    } else {
      this.licencePlate = rawLincencePlate
    }
  }
}
