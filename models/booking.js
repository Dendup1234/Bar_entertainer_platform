import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
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
    agreedAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "cancelled", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Booking", bookingSchema);
