import { AppDataSource } from "../database/typeorm-datasource";

import { User, treatmentEnum } from "../models/User";
import { sectionEnum, Train, typeEnum } from "../models/Train";
import { Travel } from "../models/Travel";
import { Booking } from "../models/Booking";

export const renfeSeed = async (): Promise<void> => {
  try {
    // Conectamos a la BBDD
    const dataSource = await AppDataSource.initialize(); // Conecta con BBDD

    console.log(`Conectados a ${dataSource?.options?.database as string}`);

    // Borramos los datos
    await AppDataSource.manager.delete(Booking, {}); // Borra la tabla
    await AppDataSource.manager.delete(Travel, {});
    await AppDataSource.manager.delete(User, {});
    await AppDataSource.manager.delete(Train, {});

    console.log("Eliminados los datos existentes");

    // Crea usuario administrador
    const admin = new User();
    admin.firstName = "admin";
    admin.lastName = "admin";
    admin.setPassword("admin");
    admin.email = "admin@gmail.com";
    admin.dni = "123456789";
    admin.nacionality = "US";
    admin.birth_date = "1990-01-01";
    admin.treatment = treatmentEnum.SR;

    await AppDataSource.manager.save(admin); // Guarda el admin en la tabla
    console.log("Creado admin");

    // Crea usuarios de ejemplo
    const user1 = new User();
    user1.firstName = "John";
    user1.lastName = "Doe";
    user1.setPassword("password1");
    user1.email = "john@example.com";
    user1.dni = "123456789";
    user1.nacionality = "US";
    user1.birth_date = "1990-01-01";
    user1.treatment = treatmentEnum.SR;

    const user2 = new User();
    user2.firstName = "Jane";
    user2.lastName = "Smith";
    user2.setPassword("password2");
    user2.email = "jane@example.com";
    user2.dni = "987654321";
    user2.nacionality = "UK";
    user2.birth_date = "1995-02-15";
    user2.treatment = treatmentEnum.SRA;

    await AppDataSource.manager.save([user1, user2]); // Podemos guardar como un array
    console.log("Creados users");

    // Crea trenes de ejemplo
    const trainList: Train[] = [];

    const train1 = new Train();
    train1.licencePlate = "ABC123";
    train1.capacity = 100;
    train1.type = typeEnum.AVE;
    train1.section = sectionEnum.NORMAL;

    const train2 = new Train();
    train2.licencePlate = "DEF456";
    train2.capacity = 200;
    train2.type = typeEnum.AVLO;
    train2.section = sectionEnum.VIP;

    trainList.push(train1, train2);

    await AppDataSource.manager.save(trainList); // Podemos guardar nombrando al array directamente
    console.log("Creados trains");

    // Crea viajes de ejemplo
    const travel1 = new Travel();
    travel1.price = 50;
    travel1.origin = "Madrid";
    travel1.destination = "Barcelona";
    travel1.departure = new Date("2023-06-05T10:00:00Z");
    travel1.arrive = new Date("2023-06-05T14:00:00Z");
    travel1.train = train1;
    travel1.bookings = [];

    const travel2 = new Travel();
    travel2.price = 80;
    travel2.origin = "Barcelona";
    travel2.destination = "Seville";
    travel2.departure = new Date("2023-06-07T09:00:00Z");
    travel2.arrive = new Date("2023-06-07T16:00:00Z");
    travel2.train = train2;
    travel2.bookings = [];

    await AppDataSource.manager.save([travel1, travel2]);
    console.log("Creados travels");

    // Crea reservas de ejemplo
    const booking1 = new Booking();
    booking1.paid = true;
    booking1.user = user1;
    booking1.travel = travel1;

    const booking2 = new Booking();
    booking2.paid = false;
    booking2.user = user2;
    booking2.travel = travel2;

    await AppDataSource.manager.save([booking1, booking2]);
    console.log("Creados bookings");
    console.log("Fin Seed de Renfe");
  } catch (error) {
    console.log(error);
  } finally {
    await AppDataSource.destroy(); // Cierra la BBDD
  }
};

void renfeSeed();
