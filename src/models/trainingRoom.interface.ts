export type CreateTrainingRoom = Omit<TrainingRoom, "_id">;

export interface TrainingRoom{
    _id: string;
    name: string;
    address: string;
    ownerId: string;
    equipments?: string[];
    capacity?: number;
    isApproved?: boolean;
}
