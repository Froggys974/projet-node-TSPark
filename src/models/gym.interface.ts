import { Types } from "mongoose";
import { IGym, GymStatus } from "../types";

export type Gym = IGym;

export interface CreateGym {
    ownerId: Types.ObjectId | string;
    name: string;
    description?: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    photos?: string[];
    capacity?: number;
    status?: GymStatus;
    approvedAt?: Date;
    approvedBy?: Types.ObjectId | string;
    isActive?: boolean;
}
