import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";

import * as userController from "./controllers/users";
import auth from "./middlewares/auth";

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const httpServer = createServer(app);
// const io = new Server(httpServer);

app.get("/", (req, res) => {
  res.send("API is Run");
});

app.post("/api/users", userController.register);
app.post("/api/users/login", userController.login);
app.get("/api/user", auth, userController.currentUser);

// io.on("connection", () => {
//   console.log("Socket IO connected!");
// });

mongoose.connect("mongodb://localhost:27017/eltrello").then(() => {
  console.log("MongoDB connected");
  httpServer.listen(4001, () => {
    console.log("API is listen on 4001 port");
  });
});