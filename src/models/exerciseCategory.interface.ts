import { IExerciseCategory } from "../types";

export type ExerciseCategory = IExerciseCategory;

export interface CreateExerciseCategory {
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
}
