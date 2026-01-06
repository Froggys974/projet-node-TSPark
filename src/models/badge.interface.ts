export type CreateBadge = Omit<Badge, "_id">;

export interface Badge{
    _id: string;
    name: string;
    description: string;
    icon?: string;
    requirement: string;
    points: number;
}
