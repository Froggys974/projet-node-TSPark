import { Model, Mongoose } from "mongoose";
import { Badge, CreateBadge } from "../../../models";
import { getBadgeSchema } from "../schema";
import { BadgeCategory, BadgeRarity } from "../../../types";

export class BadgeService {
    readonly badgeModel: Model<Badge>;

    constructor(readonly connexion: Mongoose) {
        this.badgeModel = connexion.model("Badge", getBadgeSchema());
    }

    async createBadge(badge: CreateBadge): Promise<Badge> {
        return this.badgeModel.create(badge);
    }

    async getAllBadges(): Promise<Badge[]> {
        return this.badgeModel.find();
    }

    async getBadgeById(id: string): Promise<Badge | null> {
        return this.badgeModel.findById(id);
    }

    async updateBadge(id: string, badge: Partial<CreateBadge>): Promise<Badge | null> {
        return this.badgeModel.findByIdAndUpdate(id, badge, { new: true });
    }

    async deleteBadge(id: string): Promise<void> {
        await this.badgeModel.findByIdAndDelete(id);
    }

    async getBadgesByCategory(category: BadgeCategory): Promise<Badge[]> {
        return this.badgeModel.find({ category });
    }

    async getBadgesByRarity(rarity: BadgeRarity): Promise<Badge[]> {
        return this.badgeModel.find({ rarity });
    }
}
