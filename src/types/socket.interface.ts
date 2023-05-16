import { Socket as SocketIo } from "socket.io";
import { UserDocument } from "./user.interface";
export interface Socket extends SocketIo {
  user?: UserDocument | null;
}
