import { Model, Mongoose } from "mongoose";
import { WorkoutSession, CreateWorkoutSession } from "../../../models";
import { getWorkoutSessionSchema, calculateCalories } from "../schema";
import { SessionStatus } from "../../../types";

export class WorkoutSessionService {
    readonly workoutSessionModel: Model<WorkoutSession>;

    constructor(readonly connexion: Mongoose) {
        this.workoutSessionModel = connexion.model("WorkoutSession", getWorkoutSessionSchema());
    }

    async createWorkoutSession(session: CreateWorkoutSession): Promise<WorkoutSession> {
        return this.workoutSessionModel.create(session);
    }

    async getAllWorkoutSessions(): Promise<WorkoutSession[]> {
        return this.workoutSessionModel.find();
    }

    async getWorkoutSessionById(id: string): Promise<WorkoutSession | null> {
        return this.workoutSessionModel.findById(id);
    }

    async updateWorkoutSession(id: string, session: Partial<CreateWorkoutSession>): Promise<WorkoutSession | null> {
        return this.workoutSessionModel.findByIdAndUpdate(id, session, { new: true });
    }

    async deleteWorkoutSession(id: string): Promise<void> {
        await this.workoutSessionModel.findByIdAndDelete(id);
    }

    async getSessionsByUser(userId: string): Promise<WorkoutSession[]> {
        return this.workoutSessionModel.find({ userId }).sort({ sessionDate: -1 });
    }

    async getSessionsByWorkout(workoutId: string): Promise<WorkoutSession[]> {
        return this.workoutSessionModel.find({ workoutId });
    }

    async getSessionsByStatus(status: SessionStatus): Promise<WorkoutSession[]> {
        return this.workoutSessionModel.find({ status });
    }

    async getUserSessionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkoutSession[]> {
        return this.workoutSessionModel.find({
            userId,
            sessionDate: { $gte: startDate, $lte: endDate }
        }).sort({ sessionDate: -1 });
    }

    async completeSession(id: string, overallFeeling?: any): Promise<WorkoutSession | null> {
        const session = await this.workoutSessionModel.findById(id);
        if (!session) return null;

        const completedAt = new Date();
        const actualDuration = session.startedAt
            ? Math.round((completedAt.getTime() - session.startedAt.getTime()) / 60000)
            : 0;

        return this.workoutSessionModel.findByIdAndUpdate(
            id,
            {
                status: SessionStatus.COMPLETED,
                completedAt,
                actualDuration,
                overallFeeling
            },
            { new: true }
        );
    }

    async startSession(id: string): Promise<WorkoutSession | null> {
        return this.workoutSessionModel.findByIdAndUpdate(
            id,
            {
                status: SessionStatus.IN_PROGRESS,
                startedAt: new Date()
            },
            { new: true }
        );
    }

    async abandonSession(id: string): Promise<WorkoutSession | null> {
        return this.workoutSessionModel.findByIdAndUpdate(
            id,
            { status: SessionStatus.ABANDONED },
            { new: true }
        );
    }

    async updateCalories(id: string, workout: any, steps: any[]): Promise<WorkoutSession | null> {
        const session = await this.workoutSessionModel.findById(id);
        if (!session) return null;

        const calories = calculateCalories(session, workout, steps);
        return this.workoutSessionModel.findByIdAndUpdate(
            id,
            { caloriesBurned: calories },
            { new: true }
        );
    }
}
