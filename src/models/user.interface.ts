import { Types } from "mongoose";
import { IUser, UserRole, Gender } from "../types";

export type User = IUser;

export interface CreateUser {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    address?: string;
    points: number;
    level: number;
    badges: Types.ObjectId[] | string[];
    isActive: boolean;
    isVerified: boolean;
}
