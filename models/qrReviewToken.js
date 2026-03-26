import mongoose, { Schema, Types } from "mongoose";

const qrReviewTokenSchema = new Schema(
  {
    event: {
      type: Types.ObjectId,
      ref: "Event",
      required: true,
    },
    bar: {
      type: Types.ObjectId,
      ref: "Bar",
      required: true,
    },
    entertainer: {
      type: Types.ObjectId,
      ref: "Entertainer",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    qrImageUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("QRReviewToken", qrReviewTokenSchema);
