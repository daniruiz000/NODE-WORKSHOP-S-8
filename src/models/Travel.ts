/* eslint-disable @typescript-eslint/indent */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from "typeorm";
import { Booking } from "./Booking";
import { Train } from "./Train";

@Entity()
export class Travel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: number;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column("datetime")
  departure: Date;

  @Column("datetime")
  arrive: Date;

  @OneToOne((type) => Train, (train) => train.travels)
  train: Train;

  @ManyToOne((type) => Booking, (booking) => booking.travel)
  bookings: Booking;
}
