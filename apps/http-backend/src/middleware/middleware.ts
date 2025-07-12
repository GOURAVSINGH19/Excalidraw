import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../auth/config";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"] ?? "";

  if (!token) {
    return res.status(403).json({});
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  try {
    //@ts-ignore
    req.userId = decoded.userId;

    next();
  } catch (err) {
    return res.status(403).json({});
  }
};

export default authMiddleware;
