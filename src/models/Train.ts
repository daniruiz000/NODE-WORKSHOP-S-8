import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm";
import { Travel } from "./Travel";

export enum Type {
  AVE = "AVE",
  AVLO = "AVLO",
  AVANT = "AVANT",
  RENFE = "RENFE"
}

export enum Section {
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
    type: Type;

  @Column()
    section: Section;

  @OneToMany(type => Travel, travel => travel.train, { cascade: true })
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

  // validateSections(): void {
  //   const sectionNames = this.sections.map(section => section.name);

  //   if (sectionNames.length !== 3 || !sectionNames.includes("NORMAL") || !sectionNames.includes("BUSINESS") || !sectionNames.includes("VIP")) {
  //     throw new Error("There must be exactly 3 sections: NORMAL, BUSINESS, and VIP.");
  //   }

  //   const normalSection = this.sections.find(section => section.name === "NORMAL");
  //   if (normalSection && normalSection.price > 40) {
  //     throw new Error("The price of the NORMAL section cannot exceed €40.");
  //   }

  //   const businessSection = this.sections.find(section => section.name === "BUSINESS");
  //   if (businessSection && (businessSection.price <= 40 || businessSection.price > 80)) {
  //     throw new Error("The price of the BUSINESS section must be between €41 and €80.");
  //   }

  //   const vipSection = this.sections.find(section => section.name === "VIP");
  //   if (vipSection && (vipSection.price <= 80 || vipSection.price > 200)) {
  //     throw new Error("The price of the VIP section must be between €81 and €200.");
  //   }
  // }
}

// @Entity()
// export class Section {
//   @PrimaryGeneratedColumn()
//     id: number;

//   @Column()
//     name: string;

//   @Column()
//     price: number;

//   @ManyToOne(type => Train, train => train.sections)
//     train: Train;
// }
