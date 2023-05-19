import { Schema, model } from "mongoose";
import { TaskDocumentInterface } from "../types/task.interface";

const TaskSchema = new Schema<TaskDocumentInterface>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  boardId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  columnId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

export default model<TaskDocumentInterface>("Task", TaskSchema);
