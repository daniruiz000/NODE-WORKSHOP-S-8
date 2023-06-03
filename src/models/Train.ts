import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm";
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

  @OneToMany(type => Travel, travel => travel.train)
    travels: Travel[];

  @BeforeInsert()
  @BeforeUpdate()

  checkCapacity(): void {
    if (this.capacity > 350) {
      throw new Error("Train is at full capacity.");
    }
  }

  validateLicencePlate(): void {
    const licencePlateRegex = /^(?=.*[A-Z])(?=.*\d)[A-Z\d]{6}$/;
    if (!licencePlateRegex.test(this.licencePlate)) {
      throw new Error("Licence plate must have three uppercase letters and three numbers in any order.");
    }
  }
}
