import { Schema } from "mongoose";
import { User } from "../../../models";

export function getUserSchema(): Schema<User> {
  return new Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    birthdate: { type: Date },
    fitnessLevel: { type: String },
    badges: { type: [String], default: [] },
    totalScore: { type: Number, default: 0 }
  },{
    collection: "users",
    versionKey: false
  }
);
}
