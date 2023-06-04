import { Router, type Request, type Response, type NextFunction } from "express";
import { In, type Repository } from "typeorm";

import { User } from "../models/User";
import { Booking } from "../models/Booking";

import { AppDataSource } from "../database/typeorm-datasource";

import { generateToken } from "../utils/token";
import { isAuth } from "../middlewares/auth.middleware";

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const bookingRepository: Repository<Booking> = AppDataSource.getRepository(Booking);

export const userRouter = Router();

/* EXPLICACÓN:
Cualquier persona puede registrarse, si no está registrado y logado no puede realizar ninguna acción.
Un usuario registrado puede logarse para realizar ciertas acciones.
Un usuario logado puede:
 - Buscarse por id a sí mismo pero no tiene acceso a la info del resto de usuarios.
 - Borrarse a sí mismo pero no a ningún otro.
 - Actualizarse a sí mismo pero no a ningún otro.
El admin logado puede realizar cualquier acción dentro del userRouter.
*/

// -------------------------------- CRUD: READ --------------------------------

userRouter.get("/", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    if (req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }
    const users: User[] = await userRepository.find({
      relations: ["bookings", "bookings.travel", "bookings.travel.train"],
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// --------------------------- Endpoint para obtener Usuarios por ID --------------------------------

userRouter.get("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    if (req.user.id !== idReceivedInParams && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }

    const user = await userRepository.findOne({
      where: {
        id: idReceivedInParams,
      },
      relations: ["bookings", "bookings.travel", "bookings.travel.train"],
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// -------------------------- Endpoint de LOGIN de Usuarios --------------------------------

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

    const match = user.checkPassword(req.body.password);

    if (match) {
      const jwtToken = generateToken(user.id.toString(), user.email);
      console.log(`Usuario ${user.firstName} logado correctamente`);
      return res.status(200).json({ token: jwtToken });
    } else {
      return res.status(401).json({ error: "Email y/o contraseña incorrectos" });
    }
  } catch (error) {
    next(error);
  }
});

// -------------------------------- CRUD: CREATE --------------------------------

userRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = new User();
    const bookingIds: number[] = req.body.bookings;

    if (!bookingIds.length) {
      res.status(400).json({ error: "Invalid bookingIds" });
      return;
    }
    const user = await userRepository.findOne({
      where: { email: req.body.email },
    });

    if (user) {
      res.status(400).json({ error: "Invalid params" });
      return;
    }

    const bookings = await bookingRepository.find({
      where: { id: In(bookingIds) },
    });

    if (bookingIds.length !== bookings.length) {
      res.status(404).json({ error: "One or more bookings not found" });
      return;
    }

    Object.assign(newUser, req.body);
    newUser.setPassword(req.body.password);
    newUser.bookings = bookings;

    const userSaved = await userRepository.save(newUser);

    res.status(201).json(userSaved);
  } catch (error) {
    next(error);
  }
});

// -------------------------------- CRUD: DELETE por Id --------------------------------

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
      relations: ["bookings", "bookings.travel", "bookings.travel.train"],
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

// -------------------------------- CRUD: UPDATE --------------------------------

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
      relations: ["bookings", "bookings.travel", "bookings.travel.train"],
    });

    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    const bookingIds: number[] = req.body.bookingIds || [];
    const bookings = await bookingRepository.find({
      where: { id: In(bookingIds) },
    });

    if (bookingIds.length !== bookings.length) {
      return res.status(404).json({ error: "One or more bookings not found" });
    }

    Object.assign(userToUpdate, req.body);

    userToUpdate.bookings = bookings;

    const updatedUser = await userRepository.save(userToUpdate);

    // Eliminar la propiedad 'password' del objeto 'updatedUser'
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

export default userRouter;
