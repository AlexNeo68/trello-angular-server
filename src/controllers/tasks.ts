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

export const updateTask = async (
  io: Server,
  socket: Socket,
  data: {
    boardId: string;
    taskId: string;
    fields: { title: string; description: string; columnId: string };
  }
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEventName.tasksUpdateFailure, "User is unauthorized");
    }
    const updatedTask = await TaskModel.findByIdAndUpdate(
      data.taskId,
      data.fields,
      { new: true }
    );
    io.to(data.boardId).emit(SocketEventName.tasksUpdateSuccess, updatedTask);
  } catch (error) {
    socket.emit(SocketEventName.tasksUpdateFailure, getErrorMessage(error));
  }
};

export const deleteTask = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; taskId: string }
) => {
  try {
    if (!socket.user) {
      socket.emit(SocketEventName.tasksDeleteFailure, "Error Authentication");
      return;
    }
    await TaskModel.deleteOne({ _id: data.taskId });
    io.to(data.boardId).emit(SocketEventName.tasksDeleteSuccess, data.taskId);
  } catch (err) {
    socket.emit(SocketEventName.tasksDeleteFailure, getErrorMessage(err));
  }
};
