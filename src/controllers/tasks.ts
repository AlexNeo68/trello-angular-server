import { NextFunction, Response } from "express";
import { RequestExpressInterface } from "../types/request-express.interface";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { SocketEventName } from "../types/socket-event-name.enum";
import { getErrorMessage } from "../helpers";
import TaskModel from "../models/task";

export const getTasks = async (
  req: RequestExpressInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.sendStatus(401);
    const tasks = await TaskModel.find({
      boardId: req.params.boardId,
    });
    res.send(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  io: Server,
  socket: Socket,
  data: {
    title: string;
    boardId: string;
    columnId: string;
  }
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEventName.tasksCreateFailure, "Error Authentication");
      return;
    }
    const newTask = new TaskModel({
      title: data.title,
      boardId: data.boardId,
      columnId: data.columnId,
      userId: socket.user.id,
    });
    const savedTask = await newTask.save();
    io.to(data.boardId).emit(SocketEventName.tasksCreateSuccess, savedTask);
    console.log(savedTask);
  } catch (err) {
    socket.emit(SocketEventName.tasksCreateFailure, getErrorMessage(err));
  }
};
