import { Schema } from "mongoose";
import { ExerciseType } from "../../../models";

export function getExerciseTypeSchema(): Schema<ExerciseType> {
  return new Schema<ExerciseType>({
    name: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true },
    description: { type: String }
  },{
    collection: "exerciseTypes",
    versionKey: false
  }
);
}
