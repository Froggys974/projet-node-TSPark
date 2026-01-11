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
