import { Schema } from "mongoose";
import { WorkoutStep } from "../../../models";
import { StepType, Intensity, RestType } from "../../../types";

export function getWorkoutStepSchema(): Schema<WorkoutStep> {
  const schema = new Schema<WorkoutStep>({
    workoutId: {
      type: Schema.Types.ObjectId,
      ref: "Workout",
      required: true
    },
    order: {
      type: Number,
      required: true,
      min: 1
    },
    stepType: {
      type: String,
      enum: Object.values(StepType),
      required: true
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise"
    },
    equipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Equipment"
    },
    parameters: {
      sets: Number,
      reps: Number,
      weight: Number,
      distance: Number,
      duration: Number,
      intensity: {
        type: String,
        enum: Object.values(Intensity)
      },
      tempo: String,
      notes: String
    },
    restAfter: {
      duration: Number,
      type: {
        type: String,
        enum: Object.values(RestType)
      }
    },
    supersetExercises: [{
      exerciseId: {
        type: Schema.Types.ObjectId,
        ref: "Exercise",
        required: true
      },
      equipmentId: {
        type: Schema.Types.ObjectId,
        ref: "Equipment"
      },
      parameters: {
        sets: Number,
        reps: Number,
        weight: Number,
        distance: Number,
        duration: Number,
        intensity: {
          type: String,
          enum: Object.values(Intensity)
        },
        tempo: String,
        notes: String
      }
    }],
    circuitRounds: {
      type: Number
    }
  }, {
    collection: "workoutSteps",
    versionKey: false,
    timestamps: true
  });

  schema.index({ workoutId: 1, order: 1 });
  schema.index({ exerciseId: 1 });

  return schema;
}
