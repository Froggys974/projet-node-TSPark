import { Schema } from "mongoose";
import { TrainingRoom } from "../../../models";

export function getTrainingRoomSchema(): Schema<TrainingRoom> {
  return new Schema<TrainingRoom>({
    name: { type: String, required: true },
    address: { type: String, required: true },
    ownerId: { type: String, required: true },
    equipments: { type: [String], default: [] },
    capacity: { type: Number },
    isApproved: { type: Boolean, default: false }
  },{
    collection: "trainingRooms",
    versionKey: false
  }
);
}
