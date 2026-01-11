import { Types } from "mongoose";
import { IEquipment } from "../types";

export type Equipment = IEquipment;

export interface CreateEquipment {
    gymId: Types.ObjectId | string;
    name: string;
    type: string;
    description?: string;
    muscleGroups?: string[];
    quantity?: number;
    isAvailable?: boolean;
    image?: string;
}
