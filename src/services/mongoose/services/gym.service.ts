import { Model, Mongoose } from "mongoose";
import { Gym, CreateGym } from "../../../models";
import { getGymSchema } from "../schema";
import { GymStatus } from "../../../types";

export class GymService {
    readonly gymModel: Model<Gym>;

    constructor(readonly connexion: Mongoose) {
        this.gymModel = connexion.model("Gym", getGymSchema());
    }

    async createGym(gym: CreateGym): Promise<Gym> {
        return this.gymModel.create(gym);
    }

    async getAllGyms(): Promise<Gym[]> {
        return this.gymModel.find();
    }

    async getGymById(id: string): Promise<Gym | null> {
        return this.gymModel.findById(id);
    }

    async updateGym(id: string, gym: Partial<CreateGym>): Promise<Gym | null> {
        return this.gymModel.findByIdAndUpdate(id, gym, { new: true });
    }

    async deleteGym(id: string): Promise<void> {
        await this.gymModel.findByIdAndDelete(id);
    }

    async getGymsByOwner(ownerId: string): Promise<Gym[]> {
        return this.gymModel.find({ ownerId });
    }

    async getGymsByStatus(status: GymStatus): Promise<Gym[]> {
        return this.gymModel.find({ status });
    }

    async approveGym(id: string, approvedBy: string): Promise<Gym | null> {
        return this.gymModel.findByIdAndUpdate(
            id,
            {
                status: GymStatus.APPROVED,
                approvedAt: new Date(),
                approvedBy
            },
            { new: true }
        );
    }

    async rejectGym(id: string, approvedBy: string): Promise<Gym | null> {
        return this.gymModel.findByIdAndUpdate(
            id,
            {
                status: GymStatus.REJECTED,
                approvedBy
            },
            { new: true }
        );
    }
}
