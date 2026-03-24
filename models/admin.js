import mongoose, { Schema, Types } from "mongoose";

const adminSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
});

export default mongoose.model("Admin", adminSchema);
