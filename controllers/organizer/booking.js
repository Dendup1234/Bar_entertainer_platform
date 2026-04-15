import Booking from "../../models/booking.js";
import Entertainer from "../../models/entertainer.js";
import Event from "../../models/event.js";
import { sendAppointmentEmail } from "../../utils/sendEmail.js";
import mongoose from "mongoose";

//Create a booking
export const createBooking = async (req, res) => {
  try {
    const barId = req.user.sub;
    const { entertainer, eventId } = req.body;

    if (!barId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!entertainer) {
      return res.status(400).json({ message: "Entertainer is required" });
    }

    const entertainerExists = await Entertainer.findById(entertainer);
    if (!entertainerExists) {
      return res.status(404).json({ message: "Entertainer not found" });
    }

    if (!eventId) {
      return res.status(400).json({ message: "eventId is required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // agreed amount based on the event
    const agreedAmount = event.offeredAmount;

    const existingBooking = await Booking.findOne({
      bar: barId,
      entertainer,
      event: eventId,
      status: "pending",
    });

    if (existingBooking) {
      return res.status(400).json({
        message:
          "A pending booking request already exists for this entertainer",
      });
    }

    const booking = await Booking.create({
      bar: barId,
      entertainer,
      event: eventId,
      agreedAmount: agreedAmount,
      status: "pending",
    });

    const date = event.eventDate; // better than applicationDeadline
    const name = event.title;
    const entertainerEmail = entertainerExists.email;

    //Sending the email
    await sendAppointmentEmail(entertainerEmail, name, date);

    return res.status(201).json({
      message: "Booking request sent successfully",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Getting all the booking by the bar
export const getBarBookings = async (req, res) => {
  try {
    const barId = req.user.sub;

    if (!barId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const bookings = await Booking.find({ bar: barId })
      .populate(
        "entertainer",
        "stageName profileImage entertainerType location",
      )
      .populate("event", "title eventDate")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Bookings fetched successfully",
      bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Getting all the booking stats
export const getBookingStats = async (req, res) => {
  try {
    const barId = req.user.sub; // assuming bar dashboard

    if (!barId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const stats = await Booking.aggregate([
      {
        $match: { bar: new mongoose.Types.ObjectId(barId) },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          accepted: {
            $sum: {
              $cond: [{ $eq: ["$status", "accepted"] }, 1, 0],
            },
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ["$status", "rejected"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
    };

    return res.status(200).json({
      message: "Booking stats fetched",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Searching booking by event name
export const searchBarBookingsByEventName = async (req, res) => {
  try {
    const barId = req.user.sub;
    const { q } = req.query;

    if (!barId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Event name is required" });
    }

    // Find matching events by title
    const events = await Event.find({
      title: { $regex: q, $options: "i" }, // case-insensitive search
    }).select("_id");

    const eventIds = events.map((event) => event._id);

    // Find bookings for this bar with matching event ids
    const bookings = await Booking.find({
      bar: barId,
      event: { $in: eventIds },
    })
      .populate(
        "entertainer",
        "stageName profileImage entertainerType location",
      )
      .populate("event", "title eventDate")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Bookings fetched successfully",
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
