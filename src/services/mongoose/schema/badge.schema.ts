import { Schema } from "mongoose";
import { Badge } from "../../../models";

export function getBadgeSchema(): Schema<Badge> {
  return new Schema<Badge>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String },
    requirement: { type: String, required: true },
    points: { type: Number, required: true }
  },{
    collection: "badges",
    versionKey: false
  }
);
}
