import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user";
import { Error } from "mongoose";
import { UserDocument } from "../types/user.interface";
import jwt from "jsonwebtoken";
import { secret } from "../config";
import { RequestExpressInterface } from "../types/request-express.interface";

const normalizeUser = (user: UserDocument) => {
  const token = jwt.sign({ id: user.id, email: user.email }, secret);
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    token,
  };
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email }).select(
      "+password"
    );
    const errors = { emailOrPassword: "Email or password is incorrect" };

    if (!user) {
      return res.status(422).json(errors);
    }

    if (!req.body.password) {
      return res.status(422).json(errors);
    }

    const isSamePassword = await user.validatePassword(req.body.password);
    if (!isSamePassword) {
      return res.status(422).json(errors);
    }
    return res.send(normalizeUser(user));
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newUser = new UserModel({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });

    const savedUser = await newUser.save();

    return res.send(normalizeUser(savedUser));
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(422).json(messages);
    }
    next(error);
  }
};

export const currentUser = async (
  req: RequestExpressInterface,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return res.sendStatus(401);
  res.send(normalizeUser(req.user));
};
