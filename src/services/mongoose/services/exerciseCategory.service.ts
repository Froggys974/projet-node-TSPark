import { Model, Mongoose } from "mongoose";
import { ExerciseCategory, CreateExerciseCategory } from "../../../models";
import { getExerciseCategorySchema } from "../schema";

export class ExerciseCategoryService {
    readonly exerciseCategoryModel: Model<ExerciseCategory>;

    constructor(readonly connexion: Mongoose) {
        this.exerciseCategoryModel = connexion.model("ExerciseCategory", getExerciseCategorySchema());
    }

    async createExerciseCategory(category: CreateExerciseCategory): Promise<ExerciseCategory> {
        return this.exerciseCategoryModel.create(category);
    }

    async getAllExerciseCategories(): Promise<ExerciseCategory[]> {
        return this.exerciseCategoryModel.find();
    }

    async getExerciseCategoryById(id: string): Promise<ExerciseCategory | null> {
        return this.exerciseCategoryModel.findById(id);
    }

    async getExerciseCategoryBySlug(slug: string): Promise<ExerciseCategory | null> {
        return this.exerciseCategoryModel.findOne({ slug });
    }

    async updateExerciseCategory(id: string, category: Partial<CreateExerciseCategory>): Promise<ExerciseCategory | null> {
        return this.exerciseCategoryModel.findByIdAndUpdate(id, category, { new: true });
    }

    async deleteExerciseCategory(id: string): Promise<void> {
        await this.exerciseCategoryModel.findByIdAndDelete(id);
    }
}
