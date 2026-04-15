import Booking from "../../models/booking.js";
import Entertainer from "../../models/entertainer.js";
import Event from "../../models/event.js";
import { sendAppointmentEmail } from "../../utils/sendEmail.js";

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
    console.log(entertainerEmail);

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
