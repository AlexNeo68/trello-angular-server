import { Schema } from "mongoose";

export interface TaskInterface {
  title: string;
  description?: string;
  userId: Schema.Types.ObjectId;
  boardId: Schema.Types.ObjectId;
  columnId: Schema.Types.ObjectId;
}
export interface TaskDocumentInterface extends TaskInterface, Document {}
