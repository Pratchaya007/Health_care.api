import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
    //1️⃣ Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: {
        fieldErrors: err.flatten().fieldErrors,
      },
    });
  }


  //2️⃣ Custom Error (มี status) เช่น throw { status: 403, message: "Access denied" }
  if (err.status && err.message) {
    return res.status(err.status).json({
      success: false,
      error: err.message,
    });
  }

  //3️⃣ Default Internal Error
  console.error(err);

  return res.status(500).json({
    success: false,
    error: "Internal server error",
  });
};
