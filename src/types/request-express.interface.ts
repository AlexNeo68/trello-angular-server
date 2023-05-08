import { Request } from "express";
import { UserDocument } from "./user.interface";

export interface RequestExpressInterface extends Request {
  user?: UserDocument;
}
