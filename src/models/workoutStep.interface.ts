import { Types } from "mongoose";
import { IWorkoutStep, StepType, Intensity, RestType } from "../types";

export type WorkoutStep = IWorkoutStep;

export interface CreateWorkoutStep {
    workoutId: Types.ObjectId | string;
    order: number;
    stepType: StepType;
    exerciseId?: Types.ObjectId | string;
    equipmentId?: Types.ObjectId | string;
    parameters?: {
        sets?: number;
        reps?: number;
        weight?: number;
        distance?: number;
        duration?: number;
        intensity?: Intensity;
        tempo?: string;
        notes?: string;
    };
    restAfter?: {
        duration: number;
        type: RestType;
    };
    supersetExercises?: {
        exerciseId: Types.ObjectId | string;
        equipmentId?: Types.ObjectId | string;
        parameters?: {
            sets?: number;
            reps?: number;
            weight?: number;
            distance?: number;
            duration?: number;
            intensity?: Intensity;
            tempo?: string;
            notes?: string;
        };
    }[];
    circuitRounds?: number;
}
