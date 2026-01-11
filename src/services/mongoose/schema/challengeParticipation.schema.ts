import { Schema } from "mongoose";
import { ChallengeParticipation } from "../../../models";

export function getChallengeParticipationSchema(): Schema<ChallengeParticipation> {
  const schema = new Schema<ChallengeParticipation>({
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutSession",
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    rank: {
      type: Number
    },
    pointsEarned: {
      type: Number,
      required: true,
      default: 0
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }, {
    collection: "challengeParticipations",
    versionKey: false,
    timestamps: true
  });

  schema.index({ challengeId: 1, userId: 1 }, { unique: true });
  schema.index({ challengeId: 1, rank: 1 });
  schema.index({ userId: 1 });

  return schema;
}
