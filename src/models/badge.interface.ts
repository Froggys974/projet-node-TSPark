import { IBadge, BadgeCategory, CriteriaType, BadgeRarity } from "../types";

export type Badge = IBadge;

export interface CreateBadge {
    name: string;
    description?: string;
    icon?: string;
    category: BadgeCategory;
    criteria: {
        type: CriteriaType;
        threshold: number;
    };
    points: number;
    rarity: BadgeRarity;
}
