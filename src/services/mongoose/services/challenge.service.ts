import { Model, Mongoose } from "mongoose";
import { Challenge, CreateChallenge } from "../../../models";
import { getChallengeSchema } from "../schema";
import { Visibility } from "../../../types";

export class ChallengeService {
    readonly challengeModel: Model<Challenge>;

    constructor(readonly connexion: Mongoose) {
        this.challengeModel = connexion.model("Challenge", getChallengeSchema());
    }

    async createChallenge(challenge: CreateChallenge): Promise<Challenge> {
        return this.challengeModel.create(challenge);
    }

    async getAllChallenges(): Promise<Challenge[]> {
        return this.challengeModel.find();
    }

    async getChallengeById(id: string): Promise<Challenge | null> {
        return this.challengeModel.findById(id);
    }

    async updateChallenge(id: string, challenge: Partial<CreateChallenge>): Promise<Challenge | null> {
        return this.challengeModel.findByIdAndUpdate(id, challenge, { new: true });
    }

    async deleteChallenge(id: string): Promise<void> {
        await this.challengeModel.findByIdAndDelete(id);
    }

    async getChallengesByCreator(creatorId: string): Promise<Challenge[]> {
        return this.challengeModel.find({ creatorId });
    }

    async getChallengesByGym(gymId: string): Promise<Challenge[]> {
        return this.challengeModel.find({ gymId });
    }

    async getChallengesByWorkout(workoutId: string): Promise<Challenge[]> {
        return this.challengeModel.find({ workoutId });
    }

    async getActiveChallenges(): Promise<Challenge[]> {
        const now = new Date();
        return this.challengeModel.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });
    }

    async getPublicActiveChallenges(): Promise<Challenge[]> {
        const now = new Date();
        return this.challengeModel.find({
            isActive: true,
            visibility: Visibility.PUBLIC,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });
    }

    async getChallengesWithFilters(filters: {
        visibility?: string;
        gymId?: string;
        creatorId?: string;
        workoutId?: string;
        rankingType?: string;
        isActive?: boolean;
    }): Promise<Challenge[]> {
        const query: any = {};

        if (filters.visibility) query.visibility = filters.visibility;
        if (filters.gymId) query.gymId = filters.gymId;
        if (filters.creatorId) query.creatorId = filters.creatorId;
        if (filters.workoutId) query.workoutId = filters.workoutId;
        if (filters.rankingType) query.rankingType = filters.rankingType;
        if (filters.isActive !== undefined) query.isActive = filters.isActive;

        return this.challengeModel.find(query);
    }
}
