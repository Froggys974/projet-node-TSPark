import { Model, Mongoose } from "mongoose";
import { Workout, CreateWorkout } from "../../../models";
import { getWorkoutSchema } from "../schema";
import { Visibility } from "../../../types";

export class WorkoutService {
    readonly workoutModel: Model<Workout>;

    constructor(readonly connexion: Mongoose) {
        this.workoutModel = connexion.model("Workout", getWorkoutSchema());
    }

    async createWorkout(workout: CreateWorkout): Promise<Workout> {
        return this.workoutModel.create(workout);
    }

    async getAllWorkouts(): Promise<Workout[]> {
        return this.workoutModel.find();
    }

    async getWorkoutById(id: string): Promise<Workout | null> {
        return this.workoutModel.findById(id);
    }

    async updateWorkout(id: string, workout: Partial<CreateWorkout>): Promise<Workout | null> {
        return this.workoutModel.findByIdAndUpdate(id, workout, { new: true });
    }

    async deleteWorkout(id: string): Promise<void> {
        await this.workoutModel.findByIdAndDelete(id);
    }

    async getWorkoutsByCreator(creatorId: string): Promise<Workout[]> {
        return this.workoutModel.find({ creatorId });
    }

    async getWorkoutsByGym(gymId: string): Promise<Workout[]> {
        return this.workoutModel.find({ gymId });
    }

    async getPublicWorkouts(): Promise<Workout[]> {
        return this.workoutModel.find({
            visibility: Visibility.PUBLIC,
            isActive: true
        });
    }

    async getWorkoutsWithFilters(filters: {
        categoryId?: string;
        difficulty?: string;
        visibility?: string;
        gymId?: string;
        creatorId?: string;
    }): Promise<Workout[]> {
        const query: any = { isActive: true };

        if (filters.categoryId) query.categoryId = filters.categoryId;
        if (filters.difficulty) query.difficulty = filters.difficulty;
        if (filters.visibility) query.visibility = filters.visibility;
        if (filters.gymId) query.gymId = filters.gymId;
        if (filters.creatorId) query.creatorId = filters.creatorId;

        return this.workoutModel.find(query);
    }
}
