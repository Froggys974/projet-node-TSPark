import { Model, Mongoose } from "mongoose";
import { ExerciseType } from "../../../models";
import { getExerciseTypeSchema } from "../schema";

export type CreateExerciseType = Omit<ExerciseType, "_id">;

export class ExerciseTypeService {
    readonly exerciseTypeModel: Model<ExerciseType>;

    constructor(readonly connexion: Mongoose) {
        this.exerciseTypeModel = connexion.model("ExerciseType", getExerciseTypeSchema());
    }

    async createExerciseType(exerciseType: CreateExerciseType): Promise<ExerciseType> {
        return this.exerciseTypeModel.create(exerciseType);
    }

    async getAllExerciseTypes(): Promise<ExerciseType[]> {
        return this.exerciseTypeModel.find().exec();
    }

    async getExerciseTypeById(id: string): Promise<ExerciseType | null> {
        return this.exerciseTypeModel.findOne({ _id: id }).exec();
    }

    async updateExerciseType(id: string, exerciseType: CreateExerciseType): Promise<ExerciseType | null> {
        return this.exerciseTypeModel.findByIdAndUpdate(id, exerciseType, { new: true }).exec();
    }

    async deleteExerciseType(id: string): Promise<void> {
        await this.exerciseTypeModel.findByIdAndDelete(id).exec();
    }

    async getExerciseTypesByCategory(category: string): Promise<ExerciseType[]> {
        return this.exerciseTypeModel.find({ category: category }).exec();
    }
}
