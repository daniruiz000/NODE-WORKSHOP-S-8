import { Router, type NextFunction, type Request, type Response } from "express";
import bcrypt from "bcrypt";

import { User } from "../models/User";
import { Booking } from "../models/Booking";

// Typeorm
import { AppDataSource } from "../database/typeorm-datasource";
import { type Repository } from "typeorm";

import { generateToken } from "../utils/token";
import { isAuth } from "../middlewares/auth.middleware";

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const bookingRepository: Repository<Booking> = AppDataSource.getRepository(Booking);

// Router
export const userRouter = Router();

// CRUD: READ
userRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users: User[] = await userRepository.find({
      relations: ["bookings"]
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

// LOGIN DE AUTORES
userRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const email = req.body.email;
    // const password = req.body.password;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Se deben especificar los campos email y password" });
    }

    const user = await userRepository.findOne({
      where: {
        email,
      },
      relations: ["bookings"],
    });

    if (!user) {
      // return res.status(404).json({ error: "No existe un usuario con ese email" });
      // Por seguridad mejor no indicar qué usuarios no existen
      return res.status(401).json({ error: "Email y/o contraseña incorrectos" });
    }

    // Comprueba la pass
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      // Quitamos password de la respuesta
      const userWithoutPass: any = user.toObject();
      delete userWithoutPass.password;

      // Generamos token JWT
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
    // Construimos user
    const newUser = new User();

    let bookingOfUser;

    if (req.body.bookingId) {
      bookingOfUser = await bookingRepository.find({
        where: {
          id: req.body.bookingId,
        },
      });

      if (!bookingOfUser) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }
    }

    // Asignamos valores
    Object.assign(newUser, {
      ...req.body,
      bookings: bookingOfUser,
    });

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
      res.status(404).json({ error: "User not found" });
    } else {
      await userRepository.remove(userToRemove);
      res.json(userToRemove);
    }
  } catch (error) {
    next(error);
  }
});

userRouter.put("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = req.params.id;

    if (req.user.id !== idReceivedInParams && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }
    const userToUpdate = await userRepository.findOneBy({
      id: idReceivedInParams,
    });

    if (!userToUpdate) {
      res.status(404).json({ error: "User not found" });
    } else {
      let bookingOfUser;

      if (req.body.bookingId) {
        bookingOfUser = await bookingRepository.findOne({
          where: {
            id: req.body.bookingId,
          },
        });

        if (!bookingOfUser) {
          res.status(404).json({ error: "Booking not found" });
          return;
        }
      }

      // Asignamos valores
      Object.assign(userToUpdate, {
        ...req.body,
        bookings: bookingOfUser,
      });

      const updatedUser = await userRepository.save(userToUpdate);
      res.json(updatedUser);
    }
  } catch (error) {
    next(error);
  }
});
