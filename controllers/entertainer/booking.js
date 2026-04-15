import Booking from "../../models/booking.js";
import { sendStatusEmail } from "../../utils/sendEmail.js";
import Entertainer from "../../models/entertainer.js";
import Event from "../../models/event.js";
import mongoose from "mongoose";

// Getting the booking by the singer
export const getEntertainerBookings = async (req, res) => {
  try {
    const entertainerId = req.user.sub;

    if (!entertainerId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const bookings = await Booking.find({ entertainer: entertainerId })
      .populate("bar", "businessName profileImage address")
      .populate("event", "title eventDate isPublic")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Booking requests fetched successfully",
      bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Changing the status of the booking to accepted or rejected
export const updateBookingStatus = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const entertainerId = req.user.sub;
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Invalid booking status",
      });
    }
    console.log(bookingId);
    const booking = await Booking.findOne({
      _id: bookingId,
      entertainer: entertainerId,
    }).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // If accepting, enforce one singer per event
    if (status === "accepted") {
      if (!booking.event) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "This booking is not linked to an event",
        });
      }

      const event = await Event.findById(booking.event).session(session);

      if (!event) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          message: "Event not found",
        });
      }

      // If another singer already accepted and was assigned
      if (
        event.selectedEntertainer &&
        event.selectedEntertainer.toString() !== entertainerId
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "This event already has an assigned singer",
        });
      }

      // Assign this singer to the event
      event.selectedEntertainer = entertainerId;
      await event.save({ session });

      // Set event status to in_progress
      event.status = "in_progress";

      await event.save({ session });

      // Accept this booking
      booking.status = "accepted";
      await booking.save({ session });

      // Reject all other pending bookings for the same event
      await Booking.updateMany(
        {
          event: booking.event,
          _id: { $ne: booking._id },
          status: "pending",
        },
        {
          $set: { status: "rejected" },
        },
        { session },
      );
    }

    if (status === "rejected") {
      booking.status = "rejected";
      await booking.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Getting all the required data for sending email
    const bookingInfo = await Booking.findById(bookingId)
      .populate({
        path: "bar",
        select: "email businessName",
      })
      .populate({
        path: "event",
        select: "title selectedEntertainer",
      });

    const entertainer =
      await Entertainer.findById(entertainerId).select("name stageName");

    const email = bookingInfo?.bar?.email;
    const entertainerName =
      entertainer?.stageName || entertainer?.name || "Entertainer";
    const eventName = bookingInfo?.event?.title || "Event";

    if (email) {
      await sendStatusEmail(email, entertainerName, eventName, status);
    }

    return res.status(200).json({
      message: `Booking ${status} successfully`,
      booking,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
