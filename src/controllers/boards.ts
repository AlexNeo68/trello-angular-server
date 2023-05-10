import { NextFunction, Response } from "express";
import { RequestExpressInterface } from "../types/request-express.interface";
import Board from "../models/board";

export const getBoards = async (
  req: RequestExpressInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const boards = await Board.find({ userId: req.user?.id });
    res.send(boards);
  } catch (error) {
    next(error);
  }
};

export const createBoard = async (
  req: RequestExpressInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const newBoard = new Board({
      title: req.body.title,
      userId: req.user.id,
    });
    const savedBoard = await newBoard.save();
    res.send(savedBoard);
  } catch (error) {
    next(error);
  }
};
