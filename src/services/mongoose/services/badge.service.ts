import { Model, Mongoose } from "mongoose";
import { Badge } from "../../../models";
import { getBadgeSchema } from "../schema";

export type CreateBadge = Omit<Badge, "_id">;

export class BadgeService {
    readonly badgeModel: Model<Badge>;

    constructor(readonly connexion: Mongoose) {
        this.badgeModel = connexion.model("Badge", getBadgeSchema());
    }

    async createBadge(badge: CreateBadge): Promise<Badge> {
        return this.badgeModel.create(badge);
    }

    async getAllBadges(): Promise<Badge[]> {
        return this.badgeModel.find().exec();
    }

    async getBadgeById(id: string): Promise<Badge | null> {
        return this.badgeModel.findOne({ _id: id }).exec();
    }

    async updateBadge(id: string, badge: CreateBadge): Promise<Badge | null> {
        return this.badgeModel.findByIdAndUpdate(id, badge, { new: true }).exec();
    }

    async deleteBadge(id: string): Promise<void> {
        await this.badgeModel.findByIdAndDelete(id).exec();
    }
}
