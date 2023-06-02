import { Router, type NextFunction, type Request, type Response } from "express";

// Typeorm
import { Booking } from "../models/Booking";
import { AppDataSource } from "../database/typeorm-datasource";
import { type Repository } from "typeorm";

const bookingRepository: Repository<Booking> = AppDataSource.getRepository(Booking);

// Router
export const bookingRouter = Router();

// CRUD: Read
bookingRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings: Booking[] = await bookingRepository.find({ relations: ["user", "travel"] });

    if (!bookings) {
      res.status(404).json({ error: "There are no bookings yet in the database." });
    }

    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

// CRUD: Read with ID
bookingRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Recoge los parametros
    const idParam = parseInt(req.params.id);
    // Busca por ID
    const booking = await bookingRepository.findOne({
      where: {
        id: idParam,
      },
      relations: ["user", "travel"],
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// CRUD: Create
bookingRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Creacion de objecto
    const newBooking = new Booking();

    // Asignacion de valores
    Object.assign(newBooking, req.body);

    // Insercion del booking
    const bookingSaved = await bookingRepository.save(newBooking);

    res.status(201).json(bookingSaved);
  } catch (error) {
    next(error);
  }
});

// CRUD: Delete with ID
bookingRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Recoge los parametros
    const idParam = parseInt(req.params.id);
    // Busca la reserva por ID
    const bookingToDelete = await bookingRepository.findOne({
      where: {
        id: idParam,
      },
      relations: ["user", "travel"],
    });

    if (!bookingToDelete) {
      res.status(404).json({ error: "Booking  not found" });
    }

    await bookingRepository.remove(bookingToDelete as Booking);
    res.json(bookingToDelete);
  } catch (error) {
    next(error);
  }
});

// CRUD: Update/Put
bookingRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = parseInt(req.params.id);
    // Busca la reserva por ID
    const bookingToUpdate = await bookingRepository.findOneBy({
      id: idParam,
    });

    if (!bookingToUpdate) {
      res.status(404).json({ error: "Booking not found" });
    } else {
      // Asignacion de valores
      Object.assign(bookingToUpdate, {
        paid: req.body.paid,
        user: req.body.user,
        travel: req.body.travel,
      });

      const updatedBooking = await bookingRepository.save(bookingToUpdate);

      res.status(201).json(updatedBooking);
    }
  } catch (error) {
    next(error);
  }
});
