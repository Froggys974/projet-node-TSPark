import { GymOwner } from "./gymOwner.interface";
import { User } from "./user.interface";

export type CreateChallengeParticipation = Omit<ChallengeParticipation, "_id">;

export interface ChallengeParticipation{
    _id: string;
    user: User;
    challengeId: string;
    gymOwner?: GymOwner;
    startDate: Date;
    endDate?: Date;
    status: string;
    progressValue?: number;
}