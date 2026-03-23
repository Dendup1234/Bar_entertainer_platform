import mongoose, { Schema, Types } from "mongoose";

const entertainerSchema = new mongoose.Schema(
  {
    stageName: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    experiences: {
      type: String,
      trim: true,
    },
    entertainerType: {
      type: String,
      enum: ["singer", "musician", "comedian", "dj", "dancer", "band", "other"],
      required: true,
    },
    genres: [
      {
        type: String,
        trim: true,
      },
    ],
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    city: {
      type: String,
      trim: true,
    },
    performanceFeeMin: {
      type: Number,
      default: 0,
    },
    performanceFeeMax: {
      type: Number,
      default: 0,
    },
    socialLinks: {
      instagram: String,
      youtube: String,
      tiktok: String,
      facebook: String,
    },
    availableAt: {
      type: String,
    },
    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "inactive"],
      default: "available",
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Entertainer", entertainerSchema);
