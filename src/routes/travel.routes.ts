import { Router, type NextFunction, type Request, type Response } from "express";

// Typeorm
import { AppDataSource } from "../database/typeorm-datasource";
import { type Repository } from "typeorm";
import { Travel } from "../models/Travel";
import { Train } from "../models/Train";
import { Booking } from "../models/Booking";

const travelRepository: Repository<Travel> = AppDataSource.getRepository(Travel);
const bookingRepository: Repository<Booking> = AppDataSource.getRepository(Booking);
const trainRepository: Repository<Train> = AppDataSource.getRepository(Train);
// Router
export const travelRouter = Router();

travelRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const travels: Travel[] = await travelRepository.find({ relations: ["bookings", "train"] });
    res.json({ data: travels });
  } catch (error) {
    next(error);
  }
});

travelRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);
    const travels = await travelRepository.findOne({
      where: {
        id: idReceivedInParams,
      },
      relations: ["bookings", "train"],
    });
    if (!travels) {
      res.status(404).json({ error: "Travel not found" });
    } else {
      res.json(travels);
    }
  } catch (error) {
    next(error);
  }
});

travelRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newTravel = new Travel();
    let trainOfTravel;
    let bookingOfTravel = [];
    if (req.body.trainId) {
      trainOfTravel = await trainRepository.findOne({
        where: {
          id: req.body.trainId,
        },
      });
    }
    if (!trainOfTravel) {
      res.status(404).json({ error: "Train not found" });
    }
    if (req.body.bookingId) {
      bookingOfTravel = await bookingRepository.findOne({
        where: {
          id: req.body.bookingId,
        },
      });
    }
    if (!bookingOfTravel) {
      res.status(404).json({ error: "Booking not found" });
    }
    newTravel.train = trainOfTravel;
    newTravel.price = req.body.price;
    newTravel.origin = req.body.origin;
    newTravel.destination = req.body.destination;
    newTravel.departure = req.body.departure;
    newTravel.arrive = req.body.arrive;
    newTravel.bookings = bookingOfTravel;

    const travelSaved = await travelRepository.save(newTravel);
    res.status(201).json(travelSaved);
  } catch (error) {
    next(error);
  }
});

travelRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);
    const travelsToRemove = await travelRepository.findOneBy({
      id: idReceivedInParams,
    });
    if (!travelsToRemove) {
      res.status(404).json({ error: "Travel not found" });
    } else {
      await travelRepository.remove(travelsToRemove);
      res.json(travelsToRemove);
    }
  } catch (error) {
    next(error);
  }
});

travelRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);
    const travelToUpdate = await travelRepository.findOne({
      where: {
        id: idReceivedInParams,
      },
    });
    if (!travelToUpdate) {
      res.status(404).json({ error: "Travel not found" });
    } else {
      let trainOfTravel;
      if (req.body.trainId) {
        trainOfTravel = await trainRepository.findOne({
          where: {
            id: req.body.trainId,
          },
        });
      }
      if (!trainOfTravel) {
        res.status(404).json({ error: "Train not found" });
      }
      travelToUpdate.train = trainOfTravel;
      travelToUpdate.price = req.body.price;
      travelToUpdate.origin = req.body.origin;
      travelToUpdate.destination = req.body.destination;
      travelToUpdate.departure = req.body.departure;
      travelToUpdate.arrive = req.body.arrive;
      travelToUpdate.bookings = [];

      const travelSaved = await travelRepository.save(travelToUpdate);
      res.status(201).json(travelSaved);
    }
  } catch (error) {
    next(error);
  }
});
