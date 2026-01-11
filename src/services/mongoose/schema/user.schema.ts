import { Schema } from "mongoose";
import { User } from "../../../models";
import { UserRole, Gender } from "../../../types";

export function getUserSchema(): Schema<User> {
  const schema = new Schema<User>({
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER
    },
    avatar: {
      type: String
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: Object.values(Gender)
    },
    address: {
      type: String,
      trim: true
    },
    points: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    badges: [{
      type: Schema.Types.ObjectId,
      ref: "Badge"
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  }, {
    collection: "users",
    versionKey: false,
    timestamps: true
  });

  schema.index({ role: 1 });

  schema.virtual("fullName").get(function() {
    return `${this.firstName} ${this.lastName}`;
  });

  return schema;
}
