export type CreateExerciseType = Omit<ExerciseType, "_id">;

export interface ExerciseType{
    _id: string;
    name: string;
    category: string;
    unit: string;
    description?: string;
}
