import { Model, Mongoose } from "mongoose";
import { ChallengeParticipation } from "../../../models";
import { getChallengeParticipationSchema } from "../schema";

export type CreateChallengeParticipation = Omit<ChallengeParticipation, "_id">;

export class ChallengeParticipationService {
    readonly challengeParticipationModel: Model<ChallengeParticipation>;

    constructor(readonly connexion: Mongoose) {
        this.challengeParticipationModel = connexion.model("ChallengeParticipation", getChallengeParticipationSchema());
    }

    async createChallengeParticipation(challengeParticipation: CreateChallengeParticipation): Promise<ChallengeParticipation> {
        return this.challengeParticipationModel.create(challengeParticipation);
    }

    async getAllChallengeParticipations(): Promise<ChallengeParticipation[]> {
        return this.challengeParticipationModel.find().exec();
    }

    async getChallengeParticipationById(id: string): Promise<ChallengeParticipation | null> {
        return this.challengeParticipationModel.findOne({ _id: id }).exec();
    }

    async updateChallengeParticipation(id: string, challengeParticipation: CreateChallengeParticipation): Promise<ChallengeParticipation | null> {
        return this.challengeParticipationModel.findByIdAndUpdate(id, challengeParticipation, { new: true }).exec();
    }

    async deleteChallengeParticipation(id: string): Promise<void> {
        await this.challengeParticipationModel.findByIdAndDelete(id).exec();
    }
    async getParticipationsForGymOwner(gymOwnerId: string): Promise<ChallengeParticipation[]> {
        return this.challengeParticipationModel
            .find({ gymOwner: gymOwnerId })
            .populate("gymOwner")
            .exec();
    }
    async getParticipationsForUser(userId: string): Promise<ChallengeParticipation[]> {
        return this.challengeParticipationModel
            .find({ user: userId })
            .populate("user")
            .exec();
    }
    async getParticipationsForChallengeForDate(challengeId: string, date: Date): Promise<ChallengeParticipation | null> {
        return this.challengeParticipationModel
            .findOne({
                challengeId: challengeId,
                startDate: date
            })
            .exec();

        }
}