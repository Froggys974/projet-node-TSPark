export type CreateGymOwner = Omit<GymOwner, "_id">;

export interface GymOwner{
    _id: string;
    name: string;
    email: string;
    trainingRoomId?: string;
    reputationScore?: number;
}