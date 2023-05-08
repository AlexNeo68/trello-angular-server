import { Document } from "mongoose";

export interface User {
  email: string;
  username: string;
  password: string;
  createdAt: string;
}

export interface UserDocument extends User, Document {
  validatePassword(param1: string): Promise<boolean>;
}
