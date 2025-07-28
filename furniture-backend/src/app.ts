import express, { NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import { Request, Response } from "express";

import { limiter } from "./middlewares/rateLimiter";
import healthRoutes from "./routes/v1/auth";
import authRoutes from "./routes/v1/auth";
import viewRoutes from "./routes/v1/view";
//import * as errorController from "./controllers/web/errorControllers";

export const app = express();

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use("/api/v1", healthRoutes);
app.use("/api/v1", viewRoutes);
app.use("/api/v1", authRoutes);

//app.use(errorController.notFound);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Internal Server Error";
  const errorCode = error.code || "Error_Code";
  res.status(status).json({
    message,
    error: errorCode,
  });
});
