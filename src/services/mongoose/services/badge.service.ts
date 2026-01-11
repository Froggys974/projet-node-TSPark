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

    async checkForBadges(user: any, participation: any, challenge: any): Promise<void> {
        const badges = await this.getAllBadges();
        const UserModel = this.connexion.model("User");

        for (const badge of badges) {
            if (user.badges && user.badges.some((b: any) => b.toString() === badge._id.toString())) {
                continue;
            }

            const parts = badge.requirement.match(/^(\w+)\s*([><=!]+)\s*(.+)$/);
            if (!parts) continue;

            const [, field, operator, rawValue] = parts;
            let value: any = rawValue;
            if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
                value = value.slice(1, -1);
            }

            let conditionMet = false;

            if (field === "total_score") {
                const target = parseFloat(value);
                const current = user.totalScore || 0;
                if (operator === ">=") conditionMet = current >= target;
                else if (operator === ">") conditionMet = current > target;
                else if (operator === "<=") conditionMet = current <= target;
                else if (operator === "<") conditionMet = current < target;
                else if (operator === "==") conditionMet = current === target;
            } else if (field === "workout_time") {
                const date = new Date(participation.startDate);
                if (!isNaN(date.getTime())) {
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    const timeValue = hours * 60 + minutes;

                    const [tHours, tMinutes] = value.split(":").map(Number);
                    const targetTime = tHours * 60 + tMinutes;

                    if (operator === "<") conditionMet = timeValue < targetTime;
                    else if (operator === "<=") conditionMet = timeValue <= targetTime;
                    else if (operator === ">") conditionMet = timeValue > targetTime;
                    else if (operator === ">=") conditionMet = timeValue >= targetTime;
                }
            } else if (field === "type_match") {
                 const current = challenge.exerciseType;
                 if (operator === "==") conditionMet = current === value;
            }

            if (conditionMet) {
                await UserModel.findByIdAndUpdate(user._id, { $addToSet: { badges: badge._id.toString() } });
            }
        }
    }
}
