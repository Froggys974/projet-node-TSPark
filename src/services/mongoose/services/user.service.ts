import { Model, Mongoose } from "mongoose";
import { User, CreateUser } from "../../../models";
import { getUserSchema } from "../schema";
import { UserRole } from "../../../types";

export class UserService {
    readonly userModel: Model<User>;

    constructor(readonly connexion: Mongoose) {
        this.userModel = connexion.model("User", getUserSchema());
    }

    async createUser(user: CreateUser): Promise<User> {
        return this.userModel.create(user);
    }

    async getAllUsers(): Promise<User[]> {
        return this.userModel.find();
    }

    async getUserById(id: string): Promise<User | null> {
        return this.userModel.findById(id);
    }

    async updateUser(id: string, user: Partial<CreateUser>): Promise<User | null> {
        return this.userModel.findByIdAndUpdate(id, user, { new: true });
    }

    async deleteUser(id: string): Promise<void> {
        await this.userModel.findByIdAndDelete(id);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email });
    }

    async getUserByEmailWithPassword(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).select("+password");
    }

    async getUsersByRole(role: UserRole): Promise<User[]> {
        return this.userModel.find({ role });
    }

    async addBadgeToUser(userId: string, badgeId: string): Promise<User | null> {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $addToSet: { badges: badgeId } },
            { new: true }
        );
    }

    async addPointsToUser(userId: string, points: number): Promise<User | null> {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $inc: { points: points } },
            { new: true }
        );
    }

    async isEmpty(): Promise<boolean> {
        const count = await this.userModel.countDocuments();
        return count === 0;
    }
}
