export type CreateChallenge = Omit<Challenge, "_id">;

export interface Challenge{
    _id: string;
    title: string;
    description: string;
    exerciseType: string;
    targetValue: number;
    trainingRoomId?: string;
    creatorId: string;
    startDate: Date;
    endDate: Date;
    difficulty?: string;
    rewardPoints?: number;
}
