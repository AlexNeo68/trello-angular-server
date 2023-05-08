import { Schema, model } from "mongoose";
import { UserDocument } from "../types/user.interface";
import validator from "validator";
import bcryptjs from "bcryptjs";

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: [validator.isEmail, "Email is incorrect"],
      clearIndexes: { unique: true },
    },
    username: {
      type: String,
      required: [true, "Username is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, //не выбирается из БД
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    return next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.validatePassword = function (password: string) {
  return bcryptjs.compare(password, this.password);
};

export default model("User", UserSchema);
