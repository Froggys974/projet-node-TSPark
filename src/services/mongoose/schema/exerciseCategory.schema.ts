import { Schema } from "mongoose";
import { ExerciseCategory } from "../../../models";

export function getExerciseCategorySchema(): Schema<ExerciseCategory> {
  const schema = new Schema<ExerciseCategory>({
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      trim: true
    },
    icon: {
      type: String
    }
  }, {
    collection: "exerciseCategories",
    versionKey: false,
    timestamps: true
  });

  schema.pre("save", function(next) {
    if (this.isNew || this.isModified("name")) {
      this.slug = this.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    next();
  });

  return schema;
}
