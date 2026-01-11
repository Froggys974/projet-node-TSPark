import { Schema } from "mongoose";
import { Equipment } from "../../../models";

export function getEquipmentSchema(): Schema<Equipment> {
  const schema = new Schema<Equipment>({
    gymId: {
      type: Schema.Types.ObjectId,
      ref: "Gym",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    muscleGroups: [{
      type: String,
      trim: true
    }],
    quantity: {
      type: Number,
      default: 1,
      min: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    image: {
      type: String
    }
  }, {
    collection: "equipment",
    versionKey: false,
    timestamps: true
  });

  schema.index({ gymId: 1 });
  schema.index({ type: 1 });
  schema.index({ name: "text", description: "text" });

  return schema;
}
