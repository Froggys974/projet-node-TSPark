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
        return this.badgeModel.find().exec();
    }

    async getBadgeById(id: string): Promise<Badge | null> {
        return this.badgeModel.findById(id).exec();
    }

    async updateBadge(id: string, badge: Partial<CreateBadge>): Promise<Badge | null> {
        return this.badgeModel.findByIdAndUpdate(id, badge, { new: true }).exec();
    }

    async deleteBadge(id: string): Promise<void> {
        await this.badgeModel.findByIdAndDelete(id).exec();
    }

    async getBadgesByCategory(category: BadgeCategory): Promise<Badge[]> {
        return this.badgeModel.find({ category }).exec();
    }

    async getBadgesByRarity(rarity: BadgeRarity): Promise<Badge[]> {
        return this.badgeModel.find({ rarity }).exec();
    }

    async checkForBadges(user: any, participation: any, challenge: any): Promise<void> {
        const badges = await this.getAllBadges();
        const UserModel = this.connexion.model("User");

        for (const badge of badges) {
            if (user.badges && user.badges.some((b: any) => b.toString() === badge._id.toString())) {
                continue;
            }

            // New logic based on criteria object
            if (!badge.criteria) continue;

            const { type, threshold } = badge.criteria;
            let conditionMet = false;

            // Simplified logic mapping for available data
            switch (type) {
                case "total_calories": // CriteriaType.TOTAL_CALORIES
                    // Proxy: using user.points or assuming user has totalCalories property if extended
                    const points = user.points || 0; 
                    if (points >= threshold) conditionMet = true;
                    break;
                
                case "workout_count":
                    // If user has workoutCount (not in current interface but potentially in user object passed)
                    if (user.workoutCount && user.workoutCount >= threshold) conditionMet = true;
                    break;

                case "streak_days":
                     // If user object has currentStreak
                     if (user.currentStreak && user.currentStreak >= threshold) conditionMet = true;
                     break;
            }

            if (conditionMet) {
                await UserModel.findByIdAndUpdate(user._id, { $addToSet: { badges: badge._id.toString() } });
            }
        }
    }
}
