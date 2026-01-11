import { Schema } from "mongoose";
import { WorkoutSession } from "../../../models";
import { SessionStatus, PerformanceDifficulty, ExerciseType, Intensity } from "../../../types";

export function getWorkoutSessionSchema(): Schema<WorkoutSession> {
  const schema = new Schema<WorkoutSession>({
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    workoutId: {
      type: Schema.Types.ObjectId,
      ref: "Workout",
      required: true
    },
    gymId: {
      type: Schema.Types.ObjectId,
      ref: "Gym"
    },
    sessionDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.IN_PROGRESS
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    actualDuration: {
      type: Number
    },
    stepPerformances: [{
      stepId: {
        type: Schema.Types.ObjectId,
        ref: "WorkoutStep",
        required: true
      },
      completed: {
        type: Boolean,
        default: false
      },
      actualPerformance: {
        setsCompleted: Number,
        repsCompleted: [Number],
        weightUsed: Number,
        distanceCompleted: Number,
        timeCompleted: Number,
        avgHeartRate: Number,
        difficulty: {
          type: String,
          enum: Object.values(PerformanceDifficulty)
        },
        notes: String
      },
      startTime: Date,
      endTime: Date
    }],
    overallFeeling: {
      energy: {
        type: Number,
        min: 1,
        max: 5
      },
      difficulty: {
        type: Number,
        min: 1,
        max: 5
      },
      satisfaction: {
        type: Number,
        min: 1,
        max: 5
      },
      notes: String
    },
    caloriesBurned: {
      type: Number
    }
  }, {
    collection: "workoutSessions",
    versionKey: false,
    timestamps: true
  });

  schema.index({ userId: 1 });
  schema.index({ workoutId: 1 });
  schema.index({ sessionDate: -1 });
  schema.index({ status: 1 });
  schema.index({ userId: 1, sessionDate: -1 });

  return schema;
}

export function calculateCalories(session: any, workout: any, steps: any[]): number {
  if (!session.actualDuration || !steps.length) return 0;

  let totalCalories = 0;
  const durationMinutes = session.actualDuration;

  for (const perf of session.stepPerformances || []) {
    const step = steps.find((s: any) => s._id.toString() === perf.stepId?.toString());
    if (!step || !perf.completed) continue;

    const ap = perf.actualPerformance;
    if (!ap) continue;

    let metPerMinute = 5;
    const intensity = step.parameters?.intensity;
    if (intensity === Intensity.LOW) metPerMinute = 3;
    else if (intensity === Intensity.MODERATE) metPerMinute = 5;
    else if (intensity === Intensity.HIGH) metPerMinute = 8;
    else if (intensity === Intensity.MAX) metPerMinute = 10;

    const stepDuration = ap.timeCompleted || (durationMinutes / steps.length);
    totalCalories += metPerMinute * stepDuration;
  }

  return Math.round(totalCalories);
}
