import { Schema } from "mongoose";
import { GymOwner } from "../../../models";

export function getGymOwnerSchema(): Schema<GymOwner> {
  return new Schema<GymOwner>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    trainingRoomId: { type: String },
    reputationScore: { type: Number, default: 0 }
  },{
    collection: "gymOwners",
    versionKey: false
  }
);
}
