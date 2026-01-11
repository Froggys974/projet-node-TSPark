import { Types } from "mongoose";
import { IWorkoutSession, SessionStatus, PerformanceDifficulty } from "../types";

export type WorkoutSession = IWorkoutSession;

export interface CreateWorkoutSession {
    userId: Types.ObjectId | string;
    workoutId: Types.ObjectId | string;
    gymId?: Types.ObjectId | string;
    sessionDate?: Date;
    status?: SessionStatus;
    startedAt?: Date;
    completedAt?: Date;
    actualDuration?: number;
    stepPerformances?: {
        stepId: Types.ObjectId | string;
        completed?: boolean;
        actualPerformance?: {
            setsCompleted?: number;
            repsCompleted?: number[];
            weightUsed?: number;
            distanceCompleted?: number;
            timeCompleted?: number;
            avgHeartRate?: number;
            difficulty?: PerformanceDifficulty;
            notes?: string;
        };
        startTime?: Date;
        endTime?: Date;
    }[];
    overallFeeling?: {
        energy: number;
        difficulty: number;
        satisfaction: number;
        notes?: string;
    };
    caloriesBurned?: number;
}
