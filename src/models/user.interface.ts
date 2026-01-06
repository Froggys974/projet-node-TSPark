export type CreateUser = Omit<User, "_id">;

export interface User{
    _id: string;
    name: string;
    email: string;
    birthdate?: Date;
    fitnessLevel?: string;
    badges?: string[];
    totalScore?: number;
}