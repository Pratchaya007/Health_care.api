import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

export function authenticateMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }
    const result = authorization?.split(" ");
    if (result[0] !== "Bearer") {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }
    if (!result[1]) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }
    const secretKey = process.env.JWT_SECRET;
    const payload = jwt.verify(result[1], secretKey as string);
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false, error: "Authentication required" 
    })
  }
}
