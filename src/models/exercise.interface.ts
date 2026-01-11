import { Types } from "mongoose";
import { IExercise, CreatorType, ExerciseType, Difficulty, EquipmentType, MetricType, ExerciseStatus, Visibility } from "../types";

export type Exercise = IExercise;

export interface CreateExercise {
    creatorId: Types.ObjectId | string;
    creatorType: CreatorType;
    categoryId: Types.ObjectId | string;
    name: string;
    description?: string;
    instructions?: string;
    exerciseType?: ExerciseType;
    difficulty?: Difficulty;
    equipmentType?: EquipmentType;
    muscleGroups?: string[];
    metrics?: {
        type: MetricType;
        unit: string;
        isRequired?: boolean;
    }[];
    videoUrl?: string;
    thumbnailUrl?: string;
    status?: ExerciseStatus;
    visibility?: Visibility;
}
