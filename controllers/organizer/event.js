import Event from "../../models/event.js";
import mongoose from "mongoose";
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

    const events = await Event.aggregate([
      {
        $match: {
          bar: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "entertainers",
          localField: "selectedEntertainer",
          foreignField: "_id",
          as: "selectedEntertainer",
        },
      },
      {
        $unwind: {
          path: "$selectedEntertainer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "anonymousreviews",
          localField: "_id",
          foreignField: "event",
          as: "reviews",
        },
      },
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          entertainerTypeNeeded: 1,
          genresPreferred: 1,
          eventDate: 1,
          startTime: 1,
          endTime: 1,
          venueAddress: 1,
          city: 1,
          offeredAmount: 1,
          applicationDeadline: 1,
          status: 1,
          isPublic: 1,
          createdAt: 1,
          updatedAt: 1,
          reviewCount: 1,
          selectedEntertainer: {
            _id: "$selectedEntertainer._id",
            stageName: "$selectedEntertainer.stageName",
          },
        },
      },
    ]);

    return res.status(200).json({
      message: "Success",
      events,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e.message });
  }
};

// Getting event by their id
export const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.sub;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const events = await Event.aggregate([
      {
        $match: {
          bar: new mongoose.Types.ObjectId(userId),
          _id: new mongoose.Types.ObjectId(eventId),
        },
      },
      {
        $lookup: {
          from: "entertainers",
          localField: "selectedEntertainer",
          foreignField: "_id",
          as: "selectedEntertainer",
        },
      },
      {
        $unwind: {
          path: "$selectedEntertainer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "anonymousreviews",
          localField: "_id",
          foreignField: "event",
          as: "reviews",
        },
      },
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          entertainerTypeNeeded: 1,
          genresPreferred: 1,
          eventDate: 1,
          startTime: 1,
          endTime: 1,
          venueAddress: 1,
          city: 1,
          offeredAmount: 1,
          applicationDeadline: 1,
          status: 1,
          isPublic: 1,
          createdAt: 1,
          updatedAt: 1,
          reviewCount: 1,
          selectedEntertainer: {
            _id: "$selectedEntertainer._id",
            stageName: "$selectedEntertainer.stageName",
          },
        },
      },
    ]);

    return res.status(200).json({
      message: "Success",
      events,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e.message });
  }
};

//Updating the event
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const update = req.body;
    const event = await Event.findByIdAndUpdate(eventId, update, {
      new: true,
      runValidater: true,
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.status(200).json({
      message: "event updated successful",
      event: event,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};

//Deactivating the event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndUpdate(
      eventId,
      { status: "cancelled" },
      { new: true },
    );
    return res.status(200).json({ message: "event deactivated", event: event });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};

//Searching the events
export const searchEventsByName = async (req, res) => {
  try {
    const userId = req.user.sub;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const q = (req.query.q || "").trim();
    if (!q) {
      return res.status(400).json({ message: "q (search term) is required" });
    }
    const events = await Event.aggregate([
      {
        $match: {
          bar: new mongoose.Types.ObjectId(userId),
          title: { $regex: q, $options: "i" },
        },
      },
      {
        $lookup: {
          from: "entertainers",
          localField: "selectedEntertainer",
          foreignField: "_id",
          as: "selectedEntertainer",
        },
      },
      {
        $unwind: {
          path: "$selectedEntertainer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "anonymousreviews",
          localField: "_id",
          foreignField: "event",
          as: "reviews",
        },
      },
      {
        $addFields: {
          reviewCount: { $size: "$reviews" },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          entertainerTypeNeeded: 1,
          genresPreferred: 1,
          eventDate: 1,
          startTime: 1,
          endTime: 1,
          venueAddress: 1,
          city: 1,
          offeredAmount: 1,
          applicationDeadline: 1,
          status: 1,
          isPublic: 1,
          createdAt: 1,
          updatedAt: 1,
          reviewCount: 1,
          selectedEntertainer: {
            _id: "$selectedEntertainer._id",
            stageName: "$selectedEntertainer.stageName",
          },
        },
      },
    ]);

    return res.status(200).json({
      message: "Success",
      events,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};

// Dashboard event status count
export const dashboardCount = async (req, res) => {
  try {
    const userId = req.user.sub;
    const publicCount = await Event.countDocuments({
      isPublic: true,
      bar: userId,
    });
    const privateCount = await Event.countDocuments({
      isPublic: false,
      bar: userId,
    });
    const totalCount = publicCount + privateCount;
    return res.status(200).json({
      message: "Successful",
      publicCount: publicCount,
      privateCount: privateCount,
      totalCount: totalCount,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};
