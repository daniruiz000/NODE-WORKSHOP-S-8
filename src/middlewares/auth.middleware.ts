import { User } from "../models/User";
import { verifyToken } from "../utils/token";

// Typeorm
import { AppDataSource } from "../database/typeorm-datasource";
import { type Repository } from "typeorm";

import {
  type Response,
  type NextFunction,
} from "express";

const userRepository: Repository<User> = AppDataSource.getRepository(User);

export const isAuth = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error("No tienes autorización para realizar esta operación");
    }

    const decodedInfo = verifyToken(token);
    const user = await userRepository.findOne({
      where: {
        email: decodedInfo.email,
      },
      relations: ["bookings"],
    });
    if (!user) {
      throw new Error("No tienes autorización para realizar esta operación");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json("No tienes autorización para realizar esta operación");
  }
};
