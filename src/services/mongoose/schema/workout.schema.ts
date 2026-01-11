import { Schema } from "mongoose";
import { Workout } from "../../../models";
import { CreatorType, Difficulty, Visibility } from "../../../types";

export function getWorkoutSchema(): Schema<Workout> {
  const schema = new Schema<Workout>({
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    creatorType: {
      type: String,
      enum: Object.values(CreatorType),
      required: true
    },
    gymId: {
      type: Schema.Types.ObjectId,
      ref: "Gym"
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ExerciseCategory",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    difficulty: {
      type: String,
      enum: Object.values(Difficulty),
      required: true
    },
    estimatedDuration: {
      type: Number,
      default: 0
    },
    coverImage: {
      type: String
    },
    visibility: {
      type: String,
      enum: Object.values(Visibility),
      default: Visibility.PUBLIC
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }, {
    collection: "workouts",
    versionKey: false,
    timestamps: true
  });

  schema.index({ creatorId: 1 });
  schema.index({ gymId: 1 });
  schema.index({ categoryId: 1 });
  schema.index({ visibility: 1 });
  schema.index({ difficulty: 1 });
  schema.index({ title: "text", description: "text" });

  return schema;
}
