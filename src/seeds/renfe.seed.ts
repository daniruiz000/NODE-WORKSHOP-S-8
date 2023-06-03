import { AppDataSource } from "../database/typeorm-datasource";

import { User, treatmentEnum } from "../models/User";
import { Section, Train, Type } from "../models/Train";
import { Travel } from "../models/Travel";
import { Booking } from "../models/Booking";

export const renfeSeed = async (): Promise<void> => {
  // Conectamos a la BBDD
  const dataSource = await AppDataSource.initialize()
  console.log(`Conectados a ${dataSource?.options?.database as string}`)

  // Borramos los students
  await AppDataSource.manager.delete(Booking, {})
  await AppDataSource.manager.delete(Travel, {})
  await AppDataSource.manager.delete(User, {})
  await AppDataSource.manager.delete(Train, {})

  console.log("Eliminados los datos existentes")

  // Crea usuarios de ejemplo
  const user1 = new User();
  user1.firstName = "John";
  user1.lastName = "Doe";
  user1.password = "password1";
  user1.email = "john@example.com";
  user1.dni = "123456789";
  user1.nacionality = "US";
  user1.birth_date = "1990-01-01";
  user1.treatment = treatmentEnum.SR;

  const user2 = new User();
  user2.firstName = "Jane";
  user2.lastName = "Smith";
  user2.password = "password2";
  user2.email = "jane@example.com";
  user2.dni = "987654321";
  user2.nacionality = "UK";
  user2.birth_date = "1995-02-15";
  user2.treatment = treatmentEnum.SRA;

  const userEntity1 = AppDataSource.manager.create(User, user1)
  const userEntity2 = AppDataSource.manager.create(User, user2)
  const userSaved1 = await AppDataSource.manager.save(userEntity1)
  const userSaved2 = await AppDataSource.manager.save(userEntity2)

  console.log("Creados users")

  // Crea trenes de ejemplo
  const train1 = new Train();
  train1.licencePlate = "ABC123";
  train1.capacity = 100;
  train1.type = Type.AVE;
  train1.section = Section.NORMAL;

  const train2 = new Train();
  train2.licencePlate = "DEF456";
  train2.capacity = 200;
  train2.type = Type.AVLO;
  train2.section = Section.VIP;

  const trainEntity1 = AppDataSource.manager.create(Train, train1)
  const trainEntity2 = AppDataSource.manager.create(Train, train2)
  const trainSaved1 = await AppDataSource.manager.save(trainEntity1)
  const trainSaved2 = await AppDataSource.manager.save(trainEntity2)

  console.log("Creados trenes")

  // Crea viajes de ejemplo
  const travel1 = new Travel();
  travel1.price = 50;
  travel1.origin = "Madrid";
  travel1.destination = "Barcelona";
  travel1.departure = new Date("2023-06-05T10:00:00Z");
  travel1.arrive = new Date("2023-06-05T14:00:00Z");
  travel1.train = trainSaved1;
  travel1.bookings = []

  const travel2 = new Travel();
  travel2.price = 80;
  travel2.origin = "Barcelona";
  travel2.destination = "Seville";
  travel2.departure = new Date("2023-06-07T09:00:00Z");
  travel2.arrive = new Date("2023-06-07T16:00:00Z");
  travel2.train = trainSaved2;
  travel2.bookings = []
  // Creamos entidad travel

  const travelEntity1 = AppDataSource.manager.create(Travel, travel1)
  const travelEntity2 = AppDataSource.manager.create(Travel, travel2)

  // Guardamos el travel en base de datos
  const travel1Saved = await AppDataSource.manager.save(travelEntity1)
  const travel2Saved = await AppDataSource.manager.save(travelEntity2)

  console.log("Creados los travels")

  // Crea reservas de ejemplo
  const booking1 = new Booking();
  booking1.paid = true;
  booking1.user = userSaved1;
  booking1.travel = travel1Saved;

  const booking2 = new Booking();
  booking2.paid = false;
  booking2.user = userSaved2;
  booking2.travel = travel2Saved;

  // Creamos entidad course
  const bookingEntity = AppDataSource.manager.create(Booking, [booking1, booking2])

  // Guardamos el booking en base de datos
  await AppDataSource.manager.save(bookingEntity)
  console.log("Creados bookings")
  await AppDataSource.destroy() // Cierra la BBDD
}

// // Llama a la función para generar los datos de ejemplo
void renfeSeed()
