import { Router, type Request, type Response, type NextFunction } from "express";
//  import bcrypt from "bcrypt";
import { User } from "../models/User";
import { Booking } from "../models/Booking";

import { AppDataSource } from "../database/typeorm-datasource";
import { In, type Repository } from "typeorm";

import { generateToken } from "../utils/token";
import { isAuth } from "../middlewares/auth.middleware";

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const bookingRepository: Repository<Booking> = AppDataSource.getRepository(Booking);

export const userRouter = Router();

// CRUD: READ
userRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users: User[] = await userRepository.find({
      relations: ["bookings"],
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const user = await userRepository.findOne({
      where: {
        id: idReceivedInParams,
      },
      relations: ["bookings"],
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// LOGIN DE USUARIOS

userRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Se deben especificar los campos email y password" });
    }

    const user = await userRepository.findOne({
      where: {
        email,
      },
      select: ["email", "id", "firstName", "password"],
    });

    if (!user) {
      return res.status(401).json({ error: "Email y/o contraseña incorrectos" });
    }

    // const match = await bcrypt.compare(password, user.password);
    const match = password === user.password;
    if (match) {
      const userWithoutPass: any = user as any;
      delete userWithoutPass.password;

      console.log(JSON.stringify(user));
      const jwtToken = generateToken(user.id.toString(), user.email);

      return res.status(200).json({ token: jwtToken });
    } else {
      return res.status(401).json({ error: "Email y/o contraseña incorrectos" });
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: CREATE
userRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = new User();
    const bookingIds: number[] = req.body.bookings;

    if (!bookingIds || !Array.isArray(bookingIds)) {
      res.status(400).json({ error: "Invalid bookingIds" });
      return;
    }

    const bookings = await bookingRepository.findBy({ id: In(bookingIds) });
    if (bookingIds.length !== bookings.length) {
      res.status(404).json({ error: "One or more bookings not found" });
      return;
    }

    Object.assign(newUser, { ...req.body, bookings });

    const userSaved = await userRepository.save(newUser);

    res.status(201).json(userSaved);
  } catch (error) {
    next(error);
  }
});

// CRUD: DELETE
userRouter.delete("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);
    if (req.user.id !== idReceivedInParams && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }

    const userToRemove = await userRepository.findOne({
      where: {
        id: idReceivedInParams,
      },
      relations: ["bookings"],
    });

    if (!userToRemove) {
      res.status(404).json({ error: "user not found" });
    } else {
      await userRepository.remove(userToRemove);
      res.json(userToRemove);
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: UPDATE
userRouter.put("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    if (req.user.id !== idReceivedInParams && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }

    const userToUpdate = await userRepository.findOne({
      where: {
        id: idReceivedInParams,
      },
      relations: ["bookings"],
    });

    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    const bookingIds: number[] = req.body.bookingIds || [];
    const bookings = await bookingRepository.findBy({ id: In(bookingIds) });

    if (bookingIds.length !== bookings.length) {
      return res.status(404).json({ error: "One or more bookings not found" });
    }

    Object.assign(userToUpdate, req.body);
    userToUpdate.bookings = bookings;

    const updatedUser = await userRepository.save(userToUpdate);

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

export default userRouter;
