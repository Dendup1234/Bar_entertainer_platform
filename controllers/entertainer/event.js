import Event from "../../models/event.js";
import mongoose from "mongoose";
import EventApplication from "../../models/eventApplication.js";

// getting all the events from the entertainer
export const getAllEvents = async (req, res) => {
  try {
    const userId = req.user.sub;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const events = await Event.aggregate([
      {
        $match: {
          isPublic: true,
          status: "open",
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
          bannerImageUrl: 1,
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
          bannerImageUrl: 1,
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

//logic when the entertainer apply for an event
export const applyToEvent = async (req, res) => {
  try {
    const entertainerId = req.user.sub;
    const { eventId } = req.params;

    if (!entertainerId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const alreadyApplied = await EventApplication.findOne({
      event: eventId,
      entertainer: entertainerId,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        message: "You have already applied to this event",
      });
    }

    const application = await EventApplication.create({
      event: eventId,
      entertainer: entertainerId,
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
