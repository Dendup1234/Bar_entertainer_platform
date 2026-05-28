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

import { generateSAS, confirmUpload } from "../controllers/entertainer/blob.js";

import {
  getEntertainerBookings,
  updateBookingStatus,
  getBookingStats,
} from "../controllers/entertainer/booking.js";

import {
  getAllEvents,
  getEventById,
  getMyApplications,
  applyToEvent,
} from "../controllers/entertainer/event.js";

import {
  getEntertainerReviewProfileById,
  getEntertainerReviewTable,
} from "../controllers/entertainer/review.js";

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

//Profile upload
router.post("/uploads/sas", protect, generateSAS);
router.post("/uploads/confirm", protect, confirmUpload);

// Booking api
router.get("/bookings", protect, getEntertainerBookings);
router.patch("/bookings/:bookingId/status", protect, updateBookingStatus);
router.get("/bookings/stats", protect, getBookingStats);

// Event api
router.get("/events", protect, getAllEvents);
router.get("/events/:eventId/profile", protect, getEventById);
router.post("/events/:eventId/apply", protect, applyToEvent);

// Application api
router.get("/applications", protect, getMyApplications);

// Review api
router.get("/reviews/events/stats", protect, getEntertainerReviewTable);
router.get("/reviews/:eventId/profile", protect, getEntertainerReviewProfileById);
export default router;
