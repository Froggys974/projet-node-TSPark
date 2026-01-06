import { Schema } from "mongoose";
import { ChallengeParticipation } from "../../../models";

export function getChallengeParticipationSchema(): Schema<ChallengeParticipation> {
  return new Schema<ChallengeParticipation>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    challengeId: { type: String, required: true },
    gymOwner: { type: Schema.Types.ObjectId, ref: "GymOwner" },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, required: true },
    progressValue: { type: Number, default: 0 }
  },{
    collection: "challengeParticipations",
    versionKey: false
  }
);
}
