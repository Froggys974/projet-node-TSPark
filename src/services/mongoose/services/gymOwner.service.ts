import { Model, Mongoose } from "mongoose";
import { GymOwner } from "../../../models";
import { getGymOwnerSchema } from "../schema";

export type CreateGymOwner = Omit<GymOwner, "_id">;

export class GymOwnerService {
    readonly gymOwnerModel: Model<GymOwner>;

    constructor(readonly connexion: Mongoose) {
        this.gymOwnerModel = connexion.model("GymOwner", getGymOwnerSchema());
    }

    async createGymOwner(gymOwner: CreateGymOwner): Promise<GymOwner> {
        return this.gymOwnerModel.create(gymOwner);
    }

    async getAllGymOwners(): Promise<GymOwner[]> {
        return this.gymOwnerModel.find().exec();
    }

    async getGymOwnerById(id: string): Promise<GymOwner | null> {
        return this.gymOwnerModel.findOne({ _id: id }).exec();
    }

    async updateGymOwner(id: string, gymOwner: CreateGymOwner): Promise<GymOwner | null> {
        return this.gymOwnerModel.findByIdAndUpdate(id, gymOwner, { new: true }).exec();
    }

    async deleteGymOwner(id: string): Promise<void> {
        await this.gymOwnerModel.findByIdAndDelete(id).exec();
    }


}