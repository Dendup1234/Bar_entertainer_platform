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

export default mongoose.model("EventApplication", eventApplicationSchema);
