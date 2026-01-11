import { Model, Mongoose } from "mongoose";
import { Equipment, CreateEquipment } from "../../../models";
import { getEquipmentSchema } from "../schema";

export class EquipmentService {
    readonly equipmentModel: Model<Equipment>;

    constructor(readonly connexion: Mongoose) {
        this.equipmentModel = connexion.model("Equipment", getEquipmentSchema());
    }

    async createEquipment(equipment: CreateEquipment): Promise<Equipment> {
        return this.equipmentModel.create(equipment);
    }

    async getAllEquipment(): Promise<Equipment[]> {
        return this.equipmentModel.find();
    }

    async getEquipmentById(id: string): Promise<Equipment | null> {
        return this.equipmentModel.findById(id);
    }

    async updateEquipment(id: string, equipment: Partial<CreateEquipment>): Promise<Equipment | null> {
        return this.equipmentModel.findByIdAndUpdate(id, equipment, { new: true });
    }

    async deleteEquipment(id: string): Promise<void> {
        await this.equipmentModel.findByIdAndDelete(id);
    }

    async getEquipmentByGym(gymId: string): Promise<Equipment[]> {
        return this.equipmentModel.find({ gymId });
    }

    async getEquipmentByCategory(categoryId: string): Promise<Equipment[]> {
        return this.equipmentModel.find({ categoryId });
    }

    async getEquipmentByGymAndCategory(gymId: string, categoryId: string): Promise<Equipment[]> {
        return this.equipmentModel.find({ gymId, categoryId });
    }

    async getAvailableEquipmentByGym(gymId: string): Promise<Equipment[]> {
        return this.equipmentModel.find({ gymId, isAvailable: true });
    }
}
