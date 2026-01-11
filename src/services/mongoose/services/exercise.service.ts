import { Model, Mongoose } from "mongoose";
import { Exercise, CreateExercise } from "../../../models";
import { getExerciseSchema } from "../schema";
import { ExerciseStatus, Visibility } from "../../../types";

export class ExerciseService {
    readonly exerciseModel: Model<Exercise>;

    constructor(readonly connexion: Mongoose) {
        this.exerciseModel = connexion.model("Exercise", getExerciseSchema());
    }

    async createExercise(exercise: CreateExercise): Promise<Exercise> {
        return this.exerciseModel.create(exercise);
    }

    async getAllExercises(): Promise<Exercise[]> {
        return this.exerciseModel.find();
    }

    async getExerciseById(id: string): Promise<Exercise | null> {
        return this.exerciseModel.findById(id);
    }

    async updateExercise(id: string, exercise: Partial<CreateExercise>): Promise<Exercise | null> {
        return this.exerciseModel.findByIdAndUpdate(id, exercise, { new: true });
    }

    async deleteExercise(id: string): Promise<void> {
        await this.exerciseModel.findByIdAndDelete(id);
    }

    async getExercisesByCreator(creatorId: string): Promise<Exercise[]> {
        return this.exerciseModel.find({ creatorId });
    }

    async getExercisesByCategory(categoryId: string): Promise<Exercise[]> {
        return this.exerciseModel.find({ categoryId });
    }

    async getPublicExercises(): Promise<Exercise[]> {
        return this.exerciseModel.find({
            visibility: Visibility.PUBLIC,
            status: ExerciseStatus.OFFICIAL
        });
    }

    async getExercisesWithFilters(filters: {
        categoryId?: string;
        exerciseType?: string;
        difficulty?: string;
        visibility?: string;
        status?: string;
    }): Promise<Exercise[]> {
        const query: any = {};

        if (filters.categoryId) query.categoryId = filters.categoryId;
        if (filters.exerciseType) query.exerciseType = filters.exerciseType;
        if (filters.difficulty) query.difficulty = filters.difficulty;
        if (filters.visibility) query.visibility = filters.visibility;
        if (filters.status) query.status = filters.status;

        return this.exerciseModel.find(query);
    }
}
