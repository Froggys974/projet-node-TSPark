import { Schema } from "mongoose";
import { Challenge } from "../../../models";

export function getChallengeSchema(): Schema<Challenge> {
  return new Schema<Challenge>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    exerciseType: { type: String, required: true },
    targetValue: { type: Number, required: true },
    trainingRoomId: { type: String },
    creatorId: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    difficulty: { type: String },
    rewardPoints: { type: Number, default: 0 }
  },{
    collection: "challenges",
    versionKey: false
  }
);
}
