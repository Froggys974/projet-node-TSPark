import { Types } from "mongoose";
import { IChallenge, RankingType, Visibility } from "../types";

export type Challenge = IChallenge;

export interface CreateChallenge {
    workoutId: Types.ObjectId | string;
    creatorId: Types.ObjectId | string;
    gymId?: Types.ObjectId | string;
    title: string;
    description?: string;
    rankingType: RankingType;
    startDate: Date;
    endDate: Date;
    pointsReward: {
        first: number;
        second: number;
        third: number;
        participation: number;
    };
    visibility: Visibility;
    isActive?: boolean;
}
