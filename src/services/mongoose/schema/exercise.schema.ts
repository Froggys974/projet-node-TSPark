import { Schema } from "mongoose";
import { Exercise } from "../../../models";
import {
  CreatorType,
  ExerciseType,
  Difficulty,
  ExerciseStatus,
  Visibility,
  MetricType,
  EquipmentType
} from "../../../types";

export function getExerciseSchema(): Schema<Exercise> {
  const schema = new Schema<Exercise>({
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ExerciseCategory",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    instructions: {
      type: String,
      trim: true
    },
    exerciseType: {
      type: String,
      enum: Object.values(ExerciseType),
      default: ExerciseType.STRENGTH
    },
    difficulty: {
      type: String,
      enum: Object.values(Difficulty),
      default: Difficulty.BEGINNER
    },
    equipmentType: {
      type: String,
      enum: Object.values(EquipmentType),
      default: EquipmentType.BODYWEIGHT
    },
    muscleGroups: [{
      type: String,
      trim: true
    }],
    metrics: [{
      type: {
        type: String,
        enum: Object.values(MetricType),
        required: true
      },
      unit: {
        type: String,
        required: true
      },
      isRequired: {
        type: Boolean,
        default: false
      }
    }],
    videoUrl: {
      type: String
    },
    thumbnailUrl: {
      type: String
    },
    status: {
      type: String,
      enum: Object.values(ExerciseStatus),
      default: ExerciseStatus.CUSTOM
    },
    visibility: {
      type: String,
      enum: Object.values(Visibility),
      default: Visibility.PRIVATE
    }
  }, {
    collection: "exercises",
    versionKey: false,
    timestamps: true
  });

  schema.index({ creatorId: 1 });
  schema.index({ categoryId: 1 });
  schema.index({ status: 1 });
  schema.index({ visibility: 1 });
  schema.index({ name: "text", description: "text" });

  return schema;
}
