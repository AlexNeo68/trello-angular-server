import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";

import * as userController from "./controllers/users";
import * as boardsController from "./controllers/boards";
import auth from "./middlewares/auth";
import { SocketEventName } from "./types/socket-event-name.enum";
import { Socket } from "./types/socket.interface";
import jwt from "jsonwebtoken";
import { secret } from "./config";
import UserModel from "./models/user";
import { createColumn, deleteColumn, getColumns } from "./controllers/columns";
import { createTask, getTasks } from "./controllers/tasks";

const app = express();

app.use(cors());
mongoose.set("toJSON", {
  virtuals: true,
  transform: (_, converted) => {
    delete converted._id;
  },
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.send("API is Run");
});

app.post("/api/users", userController.register);
app.post("/api/users/login", userController.login);
app.get("/api/user", auth, userController.currentUser);

app.get("/api/boards", auth, boardsController.getBoards);
app.get("/api/boards/:boardId", auth, boardsController.getBoard);
app.get("/api/boards/:boardId/columns", auth, getColumns);
app.post("/api/boards", auth, boardsController.createBoard);
app.get("/api/boards/:boardId/tasks", auth, getTasks);

io.use(async (socket: Socket, next) => {
  try {
    const token = (socket.handshake.auth.token as string) ?? "";
    console.log(token);

    const data = jwt.verify(token.split(" ")[1], secret) as {
      id: string;
      email: string;
    };

    const user = await UserModel.findById(data.id);

    if (!user) return next(new Error("Authentication error"));

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
}).on("connection", (socket) => {
  socket.on(SocketEventName.boardsJoin, (data) => {
    boardsController.joinBoard(io, socket, data);
  });
  socket.on(SocketEventName.boardsLeave, (data) => {
    boardsController.leaveBoard(io, socket, data);
  });
  socket.on(SocketEventName.columnsCreate, (data) => {
    createColumn(io, socket, data);
  });
  socket.on(SocketEventName.columnsDelete, (data) => {
    deleteColumn(io, socket, data);
  });
  socket.on(SocketEventName.tasksCreate, (data) => {
    createTask(io, socket, data);
  });
  socket.on(SocketEventName.boardsUpdate, (data) => {
    boardsController.updateBoard(io, socket, data);
  });
  socket.on(SocketEventName.boardsDelete, (data) => {
    boardsController.deleteBoard(io, socket, data);
  });
});

mongoose.connect("mongodb://localhost:27017/eltrello").then(() => {
  console.log("MongoDB connected");
  httpServer.listen(4001, () => {
    console.log("API is listen on 4001 port");
  });
});
