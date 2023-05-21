import { NextFunction, Response } from "express";
import { RequestExpressInterface } from "../types/request-express.interface";
import ColumnModel from "../models/column";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { SocketEventName } from "../types/socket-event-name.enum";
import { getErrorMessage } from "../helpers";

export const getColumns = async (
  req: RequestExpressInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const columns = await ColumnModel.find({ boardId: req.params.boardId });
    res.send(columns);
  } catch (error) {
    next(error);
  }
};

export const createColumn = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; title: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEventName.columnsCreateFailure, "Error Authentication");
      return;
    }
    const newColumn = new ColumnModel({
      title: data.title,
      boardId: data.boardId,
      userId: socket.user.id,
    });
    const savedColumn = await newColumn.save();
    io.to(data.boardId).emit(SocketEventName.columnsCreateSuccess, savedColumn);
    console.log(savedColumn);
  } catch (err) {
    socket.emit(SocketEventName.columnsCreateFailure, getErrorMessage(err));
  }
};

export const deleteColumn = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; columnId: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEventName.columnsDeleteFailure, "Error Authentication");
      return;
    }
    await ColumnModel.deleteOne({ _id: data.columnId });
    io.to(data.boardId).emit(
      SocketEventName.columnsDeleteSuccess,
      data.columnId
    );
  } catch (err) {
    socket.emit(SocketEventName.columnsDeleteFailure, getErrorMessage(err));
  }
};
