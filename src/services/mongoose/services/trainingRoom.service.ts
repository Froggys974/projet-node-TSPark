import { Model, Mongoose } from "mongoose";
import { TrainingRoom } from "../../../models";
import { getTrainingRoomSchema } from "../schema";

export type CreateTrainingRoom = Omit<TrainingRoom, "_id">;

export class TrainingRoomService {
    readonly trainingRoomModel: Model<TrainingRoom>;

    constructor(readonly connexion: Mongoose) {
        this.trainingRoomModel = connexion.model("TrainingRoom", getTrainingRoomSchema());
    }

    async createTrainingRoom(trainingRoom: CreateTrainingRoom): Promise<TrainingRoom> {
        return this.trainingRoomModel.create(trainingRoom);
    }

    async getAllTrainingRooms(): Promise<TrainingRoom[]> {
        return this.trainingRoomModel.find().exec();
    }

    async getTrainingRoomById(id: string): Promise<TrainingRoom | null> {
        return this.trainingRoomModel.findOne({ _id: id }).exec();
    }

    async updateTrainingRoom(id: string, trainingRoom: CreateTrainingRoom): Promise<TrainingRoom | null> {
        return this.trainingRoomModel.findByIdAndUpdate(id, trainingRoom, { new: true }).exec();
    }

    async deleteTrainingRoom(id: string): Promise<void> {
        await this.trainingRoomModel.findByIdAndDelete(id).exec();
    }

    async getTrainingRoomsByOwner(ownerId: string): Promise<TrainingRoom[]> {
        return this.trainingRoomModel.find({ ownerId: ownerId }).exec();
    }

    async approveTrainingRoom(id: string): Promise<TrainingRoom | null> {
        return this.trainingRoomModel.findByIdAndUpdate(id, { isApproved: true }, { new: true }).exec();
    }
}
