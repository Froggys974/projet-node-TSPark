import { Model, Mongoose } from "mongoose";
import { ChallengeParticipation, CreateChallengeParticipation } from "../../../models";
import { getChallengeParticipationSchema } from "../schema";

export class ChallengeParticipationService {
    readonly challengeParticipationModel: Model<ChallengeParticipation>;

    constructor(readonly connexion: Mongoose) {
        this.challengeParticipationModel = connexion.model("ChallengeParticipation", getChallengeParticipationSchema());
    }

    async createChallengeParticipation(participation: CreateChallengeParticipation): Promise<ChallengeParticipation> {
        return this.challengeParticipationModel.create(participation);
    }

    async getAllChallengeParticipations(): Promise<ChallengeParticipation[]> {
        return this.challengeParticipationModel.find();
    }

    async getChallengeParticipationById(id: string): Promise<ChallengeParticipation | null> {
        return this.challengeParticipationModel.findById(id);
    }

    async updateChallengeParticipation(id: string, participation: Partial<CreateChallengeParticipation>): Promise<ChallengeParticipation | null> {
        return this.challengeParticipationModel.findByIdAndUpdate(id, participation, { new: true });
    }

    async deleteChallengeParticipation(id: string): Promise<void> {
        await this.challengeParticipationModel.findByIdAndDelete(id);
    }

    async getParticipationsByChallenge(challengeId: string): Promise<ChallengeParticipation[]> {
        return this.challengeParticipationModel
            .find({ challengeId })
            .sort({ score: -1 });
    }

    async getParticipationsByUser(userId: string): Promise<ChallengeParticipation[]> {
        return this.challengeParticipationModel
            .find({ userId })
            .populate("challengeId");
    }

    async getUserParticipationInChallenge(userId: string, challengeId: string): Promise<ChallengeParticipation | null> {
        return this.challengeParticipationModel
            .findOne({ userId, challengeId });
    }

    async updateRankings(challengeId: string): Promise<void> {
        const participations = await this.challengeParticipationModel
            .find({ challengeId })
            .sort({ score: -1 });

        for (let i = 0; i < participations.length; i++) {
            const participation = participations[i];
            if (participation) {
                await this.challengeParticipationModel.findByIdAndUpdate(
                    participation._id,
                    { rank: i + 1 }
                );
            }
        }
    }

    async getTopParticipants(challengeId: string, limit: number = 10): Promise<ChallengeParticipation[]> {
        return this.challengeParticipationModel
            .find({ challengeId })
            .sort({ score: -1 })
            .limit(limit)
            .populate("userId");
    }
}
