import express from "express";
import { protect } from "../middleware/auth.middleware.js";

import {
  sendOtp,
  resendOtp,
  verifyOtp,
  login,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  setNewPassword,
} from "../controllers/entertainer/auth.js";

import {
  getProfile,
  updateProfile,
} from "../controllers/entertainer/profile.js";

const router = express.Router();

// Authentication api
router.post("/send-otp", sendOtp);
router.post("/resend-otp", resendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/password-reset/send-otp", sendPasswordResetOtp);
router.post("/password-reset/verify-otp", verifyPasswordResetOtp);
router.post("/password-reset/set-new", setNewPassword);

//Profile api
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);

export default router;
