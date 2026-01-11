import { Types } from "mongoose";
import { IWorkout, CreatorType, Difficulty, Visibility } from "../types";

export type Workout = IWorkout;

export interface CreateWorkout {
    creatorId: Types.ObjectId | string;
    creatorType: CreatorType;
    gymId?: Types.ObjectId | string;
    categoryId: Types.ObjectId | string;
    title: string;
    description?: string;
    difficulty: Difficulty;
    estimatedDuration?: number;
    coverImage?: string;
    visibility?: Visibility;
    isActive?: boolean;
}
