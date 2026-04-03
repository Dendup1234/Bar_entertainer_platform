import mongoose, { Schema, Types } from "mongoose";

const eventSchema = new Schema(
  {
    bar: {
      type: Types.ObjectId,
      ref: "Bar",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    bannerImageUrl: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      trim: true,
    },
    entertainerTypeNeeded: [
      {
        type: String,
        enum: ["singer", "comedian", "dj", "dancer", "band", "other", "all"],
        required: true,
      },
    ],
    genresPreferred: [String],
    eventDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    venueAddress: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    offeredAmount: {
      type: Number,
      default: 0,
    },
    applicationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled"],
      default: "open",
    },
    selectedEntertainer: {
      type: Types.ObjectId,
      ref: "Entertainer",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Event", eventSchema);
