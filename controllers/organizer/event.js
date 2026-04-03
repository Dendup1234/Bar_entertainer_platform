import Event from "../../models/event.js";
// creation of event
export const createEvent = async (req, res) => {
  try {
    const userId = req.user.sub;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const {
      title,
      description,
      entertainerTypeNeeded,
      genresPreferred,
      eventDate,
      startTime,
      endTime,
      venueAddress,
      city,
      offeredAmount,
      applicationDeadline,
      isPublic,
    } = req.body;

    let event = await Event.create({
      title,
      description,
      entertainerTypeNeeded,
      genresPreferred,
      eventDate,
      startTime,
      endTime,
      venueAddress,
      city,
      offeredAmount,
      applicationDeadline,
      isPublic,
      bar: userId,
    });
    res.status(201).json({
      message: "Event created successfully",
      event: event,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};

// getting all the events from the dashboard
export const getAllEvents = async (req, res) => {
  try {
    const userId = req.user.sub;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const events = await Event.find({ bar: userId });
    return res.status(200).json({ message: "Success", events: events });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};
