import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { secret } from "../config";
import userModel from "../models/user";
import { RequestExpressInterface } from "../types/request-express.interface";

export default async (
  req: RequestExpressInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(" ")[1];

    const data = jwt.verify(token, secret) as { id: string; email: string };

    const user = await userModel.findById(data.id);

    if (!user) return res.sendStatus(401);

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
