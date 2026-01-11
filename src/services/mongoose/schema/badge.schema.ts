import { Schema } from "mongoose";
import { Badge } from "../../../models";
import { BadgeCategory, BadgeRarity, CriteriaType } from "../../../types";

export function getBadgeSchema(): Schema<Badge> {
  const schema = new Schema<Badge>({
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    icon: {
      type: String
    },
    category: {
      type: String,
      enum: Object.values(BadgeCategory),
      required: true
    },
    criteria: {
      type: {
        type: String,
        enum: Object.values(CriteriaType),
        required: true
      },
      threshold: {
        type: Number,
        required: true
      }
    },
    points: {
      type: Number,
      required: true,
      default: 0
    },
    rarity: {
      type: String,
      enum: Object.values(BadgeRarity),
      required: true
    }
  }, {
    collection: "badges",
    versionKey: false,
    timestamps: true
  });

  schema.index({ category: 1 });
  schema.index({ rarity: 1 });

  return schema;
}
