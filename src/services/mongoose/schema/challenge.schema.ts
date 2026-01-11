import { Schema } from "mongoose";
import { Challenge } from "../../../models";
import { RankingType, Visibility } from "../../../types";

export function getChallengeSchema(): Schema<Challenge> {
  const schema = new Schema<Challenge>({
    workoutId: {
      type: Schema.Types.ObjectId,
      ref: "Workout",
      required: true
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    gymId: {
      type: Schema.Types.ObjectId,
      ref: "Gym"
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    rankingType: {
      type: String,
      enum: Object.values(RankingType),
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    pointsReward: {
      first: {
        type: Number,
        default: 100
      },
      second: {
        type: Number,
        default: 50
      },
      third: {
        type: Number,
        default: 25
      },
      participation: {
        type: Number,
        default: 10
      }
    },
    visibility: {
      type: String,
      enum: Object.values(Visibility),
      default: Visibility.PUBLIC
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }, {
    collection: "challenges",
    versionKey: false,
    timestamps: true
  });

  schema.index({ workoutId: 1 });
  schema.index({ creatorId: 1 });
  schema.index({ startDate: 1, endDate: 1 });
  schema.index({ isActive: 1 });

  schema.pre("save", function(next) {
    if (this.endDate <= this.startDate) {
      next(new Error("End date must be after start date"));
    }
    next();
  });

  return schema;
}
