import { Model, Mongoose } from "mongoose";
import { User } from "../../../models";
import { getUserSchema } from "../schema";

export type CreateUser = Omit<User, "_id">;

export class UserService {
    readonly userModel: Model<User>;

    constructor(readonly connexion: Mongoose) {
        this.userModel = connexion.model("User", getUserSchema());
    }

    async createUser(user: CreateUser): Promise<User> {
        return this.userModel.create(user);
    }

    async getAllUsers(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async getUserById(id: string): Promise<User | null> {
        return this.userModel.findOne({ _id: id }).exec();
    }

    async updateUser(id: string, user: CreateUser): Promise<User | null> {
        return this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();
    }

    async deleteUser(id: string): Promise<void> {
        await this.userModel.findByIdAndDelete(id).exec();
    }

}