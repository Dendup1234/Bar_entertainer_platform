import mongoose, { Schema, Types } from "mongoose";

const anonymousReviewSchema = new Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    bar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bar",
      required: true,
    },
    entertainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entertainer",
      required: true,
    },
    qrToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QRReviewToken",
      required: true,
    },
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    performanceRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    professionalismRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    crowdEngagementRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    reviewerLabel: {
      type: String,
      default: "Anonymous attendee",
    },
    deviceHash: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
    moderationStatus: {
      type: String,
      enum: ["visible", "hidden", "flagged"],
      default: "visible",
    },
  },
  { timestamps: true },
);

export default mongoose.model("AnonymousReview", anonymousReviewSchema);
