import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from "typeorm";
import { Travel } from "./Travel";
import { User } from "./User";

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    paid: boolean;

  @ManyToOne(type => User, user => user.bookings)
    user: User;

  @OneToOne(type => Travel, travel => travel.bookings, { cascade: true })
    travel: Travel;
}
