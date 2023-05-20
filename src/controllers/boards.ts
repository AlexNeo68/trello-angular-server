import { NextFunction, Response } from "express";
import { RequestExpressInterface } from "../types/request-express.interface";
import Board from "../models/board";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { SocketEventName } from "../types/socket-event-name.enum";
import { getErrorMessage } from "../helpers";

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

export const getBoard = async (
  req: RequestExpressInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const board = await Board.findById(req.params.boardId);
    res.send(board);
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

export const joinBoard = (
  io: Server,
  socket: Socket,
  data: { boardId: string }
) => {
  console.log("Server socket to join", socket.user);
  socket.join(data.boardId);
};

export const leaveBoard = (
  io: Server,
  socket: Socket,
  data: { boardId: string }
) => {
  console.log("Server socket leave board", data.boardId);
  socket.leave(data.boardId);
};

export const updateBoard = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; fields: { title: string } }
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEventName.boardsUpdateFailure, "User is unauthorized");
    }
    const updatedBoard = await Board.findByIdAndUpdate(
      data.boardId,
      data.fields,
      { new: true }
    );
    io.to(data.boardId).emit(SocketEventName.boardsUpdateSuccess, updatedBoard);
  } catch (error) {
    socket.emit(SocketEventName.boardsUpdateFailure, getErrorMessage(error));
  }
};
