import express from "express";
import cors from "cors";

import {
  type Request,
  type Response,
} from "express";

import { trainRouter } from "./routes/train.routes";
import { userRouter } from "./routes/user.routes";
import { bookingRouter } from "./routes/booking.routes";
import { travelRouter } from "./routes/travel.routes";

import { AppDataSource } from "./database/typeorm-datasource";

import { infoReq } from "./middlewares/infoReq.middleware";
import { checkError } from "./middlewares/error.middleware";

const main = async (): Promise<void> => {
  // Conexión a la BBDD

  const dataSource = await AppDataSource.initialize()

  // Configuración del server
  const PORT = 3000;
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(
    cors({
      origin: "http://localhost:3000",
    })
  );

  // Rutas
  const router = express.Router();
  router.get("/", (req: Request, res: Response) => {
    res.send(`<h3>Esta es la home de nuestra API.</h3>
    <p> Estamos utilizando la BBDD TypeORM de ${dataSource.options.database as string}.</p>`);
  });
  router.get("*", (req: Request, res: Response) => {
    res.status(404).send("Lo sentimos :( No hemos encontrado la página solicitada.");
  });

  // Middleware previo de Info de la req.
  app.use(infoReq);

  // Usamos las rutas
  app.use("/user", userRouter);
  app.use("/train", trainRouter);
  app.use("/travel", travelRouter);
  app.use("/booking", bookingRouter);
  app.use("/", router);

  // Middleware de gestión de los Errores.
  app.use(checkError);

  app.listen(PORT, () => {
    console.log(`Server levantado en el puerto ${PORT}`);
  });
};

void main(); // Si queremos que se espere a que acabe await si da igual void
