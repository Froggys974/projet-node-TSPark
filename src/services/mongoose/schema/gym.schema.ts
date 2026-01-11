import { Schema } from "mongoose";
import { Gym } from "../../../models";
import { GymStatus } from "../../../types";

export function getGymSchema(): Schema<Gym> {
  const schema = new Schema<Gym>({
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    logo: {
      type: String
    },
    photos: [{
      type: String
    }],
    capacity: {
      type: Number
    },
    status: {
      type: String,
      enum: Object.values(GymStatus),
      default: GymStatus.PENDING
    },
    approvedAt: {
      type: Date
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }, {
    collection: "gyms",
    versionKey: false,
    timestamps: true
  });

  schema.index({ ownerId: 1 });
  schema.index({ status: 1 });
  schema.index({ name: "text", description: "text" });

  return schema;
}
