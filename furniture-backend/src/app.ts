import express, { NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import { check } from "./middlewares/check";
import { Request, Response } from "express";

import { limiter } from "./middlewares/rateLimiter";

export const app = express();

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(limiter);

interface CustomRequest extends Request {
  userId?: number;
}

app.get("/health", check, (req: CustomRequest, res: Response) => {
  throw new Error("This is a test error");
  res.status(200).json({
    message: "Hello we are ready for sending response",
    userId: req.userId || 7,
  });
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Internal Server Error";
  const errorCode = error.code || "Error_Code";
  res.status(status).json({
    message,
    error: errorCode,
  });
});
