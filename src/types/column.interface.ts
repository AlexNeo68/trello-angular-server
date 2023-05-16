import { Document, Schema } from "mongoose";

export interface Column {
  title: string;
  userId: Schema.Types.ObjectId;
  boardId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColumnDocument extends Column, Document {}
