import { Model, Mongoose } from "mongoose";
import { WorkoutStep, CreateWorkoutStep } from "../../../models";
import { getWorkoutStepSchema } from "../schema";

export class WorkoutStepService {
    readonly workoutStepModel: Model<WorkoutStep>;

    constructor(readonly connexion: Mongoose) {
        this.workoutStepModel = connexion.model("WorkoutStep", getWorkoutStepSchema());
    }

    async createWorkoutStep(step: CreateWorkoutStep): Promise<WorkoutStep> {
        return this.workoutStepModel.create(step);
    }

    async getAllWorkoutSteps(): Promise<WorkoutStep[]> {
        return this.workoutStepModel.find();
    }

    async getWorkoutStepById(id: string): Promise<WorkoutStep | null> {
        return this.workoutStepModel.findById(id);
    }

    async updateWorkoutStep(id: string, step: Partial<CreateWorkoutStep>): Promise<WorkoutStep | null> {
        return this.workoutStepModel.findByIdAndUpdate(id, step, { new: true });
    }

    async deleteWorkoutStep(id: string): Promise<void> {
        await this.workoutStepModel.findByIdAndDelete(id);
    }

    async getStepsByWorkout(workoutId: string): Promise<WorkoutStep[]> {
        return this.workoutStepModel.find({ workoutId }).sort({ order: 1 });
    }

    async deleteStepsByWorkout(workoutId: string): Promise<void> {
        await this.workoutStepModel.deleteMany({ workoutId });
    }

    async reorderSteps(workoutId: string, stepIds: string[]): Promise<void> {
        for (let i = 0; i < stepIds.length; i++) {
            await this.workoutStepModel.findByIdAndUpdate(stepIds[i], { order: i + 1 });
        }
    }
}
