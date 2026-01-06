import { Model, Mongoose } from "mongoose";
import { Challenge } from "../../../models";
import { getChallengeSchema } from "../schema";

export type CreateChallenge = Omit<Challenge, "_id">;

export class ChallengeService {
    readonly challengeModel: Model<Challenge>;

    constructor(readonly connexion: Mongoose) {
        this.challengeModel = connexion.model("Challenge", getChallengeSchema());
    }

    async createChallenge(challenge: CreateChallenge): Promise<Challenge> {
        return this.challengeModel.create(challenge);
    }

    async getAllChallenges(): Promise<Challenge[]> {
        return this.challengeModel.find().exec();
    }

    async getChallengeById(id: string): Promise<Challenge | null> {
        return this.challengeModel.findOne({ _id: id }).exec();
    }

    async updateChallenge(id: string, challenge: CreateChallenge): Promise<Challenge | null> {
        return this.challengeModel.findByIdAndUpdate(id, challenge, { new: true }).exec();
    }

    async deleteChallenge(id: string): Promise<void> {
        await this.challengeModel.findByIdAndDelete(id).exec();
    }

    async getChallengesByCreator(creatorId: string): Promise<Challenge[]> {
        return this.challengeModel.find({ creatorId: creatorId }).exec();
    }

    async getChallengesByTrainingRoom(trainingRoomId: string): Promise<Challenge[]> {
        return this.challengeModel.find({ trainingRoomId: trainingRoomId }).exec();
    }
}
