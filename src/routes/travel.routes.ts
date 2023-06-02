import { Router, type NextFunction, type Request, type Response } from "express";
import { In, type Repository } from "typeorm";
import { AppDataSource } from "../database/typeorm-datasource";
import { Travel } from "../models/Travel";
import { Booking } from "../models/Booking";
import { Train } from "../models/Train";

const travelRepository: Repository<Travel> = AppDataSource.getRepository(Travel);
const bookingRepository: Repository<Booking> = AppDataSource.getRepository(Booking);
const trainRepository: Repository<Train> = AppDataSource.getRepository(Train);
const travelRouter = Router();

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
    const travel = await travelRepository.findOne({
      where: {
        id: idReceivedInParams,
      },
      relations: ["bookings", "train"],
    });
    if (!travel) {
      res.status(404).json({ error: "Travel not found" });
    } else {
      res.json(travel);
    }
  } catch (error) {
    next(error);
  }
});

travelRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newTravel = new Travel();
    const trainId = req.body.trainId;
    const bookingIds: number[] = req.body.bookingIds;

    const train = await trainRepository.findOne({
      where: {
        id: trainId,
      },
    });

    if (!train) {
      res.status(404).json({ error: "Train not found" });
      return;
    }

    const bookings = await bookingRepository.find({ where: { id: In(bookingIds) } });

    if (bookingIds.length !== bookings.length) {
      res.status(404).json({ error: "One or more bookings not found" });
      return;
    }

    Object.assign(newTravel, req.body);
    newTravel.train = train;
    newTravel.bookings = bookings;

    const travelSaved = await travelRepository.save(newTravel);
    res.status(201).json(travelSaved);
  } catch (error) {
    next(error);
  }
});

travelRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);
    const travelToRemove = await travelRepository.findOne({
      where: {
        id: idReceivedInParams,
      },
    });

    if (!travelToRemove) {
      res.status(404).json({ error: "Travel not found" });
      return;
    }

    await travelRepository.remove(travelToRemove);
    res.json(travelToRemove);
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
      return;
    }

    const trainId = req.body.trainId;
    const bookingIds: number[] = req.body.bookingIds;

    const train = await trainRepository.findOne({
      where: {
        id: trainId,
      },
    });

    if (!train) {
      res.status(404).json({ error: "Train not found" });
      return;
    }

    const bookings = await bookingRepository.find({ where: { id: In(bookingIds) } });

    if (bookingIds.length !== bookings.length) {
      res.status(404).json({ error: "One or more bookings not found" });
      return;
    }

    Object.assign(travelToUpdate, req.body);
    travelToUpdate.train = train;
    travelToUpdate.bookings = bookings;

    const travelSaved = await travelRepository.save(travelToUpdate);
    res.status(201).json(travelSaved);
  } catch (error) {
    next(error);
  }
});

export { travelRouter };
