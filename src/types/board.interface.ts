import { Document, Schema } from "mongoose";

export interface Board {
  title: string;
  userId: Schema.Types.ObjectId;
}

export interface BoardDocument extends Board, Document {}
