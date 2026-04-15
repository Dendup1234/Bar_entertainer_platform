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
} from "../controllers/organizer/auth.js";

import { getProfile, updateProfile } from "../controllers/organizer/profile.js";

import {
  getAllEntertainer,
  getEntertainerById,
  searchEntertainer,
} from "../controllers/organizer/entertainer.js";

import {
  createEvent,
  getAllEvents,
  updateEvent,
  getEventById,
  searchEventsByName,
  deleteEvent,
  dashboardCount,
} from "../controllers/organizer/event.js";

import { generateSAS, confirmUpload } from "../controllers/organizer/blob.js";

import {
  createBooking,
  getBarBookings,
  getBookingStats,
  searchBarBookingsByEventName,
} from "../controllers/organizer/booking.js";

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

//Entertainer api
router.get("/entertainer", protect, getAllEntertainer);
router.get("/entertainer/:entertainerId", protect, getEntertainerById);
router.get("/entertainer/search/query/", protect, searchEntertainer);

//Event api
router.post("/event", protect, createEvent);
router.get("/event", protect, getAllEvents);
router.get("/event/:eventId", protect, getEventById);
router.patch("/event/:eventId", protect, updateEvent);
router.delete("/event/:eventId", protect, deleteEvent);
router.get("/event/search/query", protect, searchEventsByName);
router.get("/event/dashboard/count", protect, dashboardCount);

//Profile upload
router.post("/uploads/sas", protect, generateSAS);
router.post("/uploads/confirm", protect, confirmUpload);

//Booking api
router.post("/bookings", protect, createBooking);
router.get("/bookings", protect, getBarBookings);
router.get("/bookings/stats", protect, getBookingStats);
router.get("/bookings/search/query", protect, searchBarBookingsByEventName);

export default router;
