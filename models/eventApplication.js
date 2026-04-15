import mongoose from "mongoose";

const eventApplicationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    entertainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entertainer",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);
// Prevent duplicate applications for same event by same entertainer
eventApplicationSchema.index({ event: 1, entertainer: 1 }, { unique: true });

export default mongoose.model("EventApplication", eventApplicationSchema);
