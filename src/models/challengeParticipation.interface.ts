import { Types } from "mongoose";
import { IChallengeParticipation } from "../types";

export type ChallengeParticipation = IChallengeParticipation;

export interface CreateChallengeParticipation {
    challengeId: Types.ObjectId | string;
    userId: Types.ObjectId | string;
    sessionId: Types.ObjectId | string;
    score: number;
    rank?: number;
    pointsEarned?: number;
    completedAt?: Date;
}
