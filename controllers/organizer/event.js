import Event from "../../models/event.js";
import EventApplication from "../../models/eventApplication.js";
import mongoose from "mongoose";
import { sendApplicationEmail } from "../../utils/sendEmail.js";

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

// Getting all the applications
export const getBarEventApplications = async (req, res) => {
  try {
    const barId = req.user.sub;
    const { status, eventName } = req.query;

    if (!barId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Find bar's events first
    const eventQuery = { bar: barId };

    if (eventName) {
      eventQuery.title = { $regex: eventName, $options: "i" };
    }

    const events = await Event.find(eventQuery).select("_id");
    const eventIds = events.map((event) => event._id);

    const applicationQuery = {
      event: { $in: eventIds },
    };

    if (status) {
      applicationQuery.status = status;
    }

    const applications = await EventApplication.find(applicationQuery)
      .populate("event", "title eventDate")
      .populate(
        "entertainer",
        "stageName profileImage entertainerType location",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Applications fetched successfully",
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// getting event with shortlisted application
export const getBarEventApplicationsShortlisted = async (req, res) => {
  try {
    const barId = req.user.sub;
    const { eventName } = req.query;

    if (!barId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const eventQuery = { bar: barId };

    if (eventName) {
      eventQuery.title = { $regex: eventName, $options: "i" };
    }

    const events = await Event.find(eventQuery).select("_id");
    const eventIds = events.map((event) => event._id);

    const applicationQuery = {
      event: { $in: eventIds },
      status: "shortlisted",
    };

    const applications = await EventApplication.find(applicationQuery)
      .populate("event", "title eventDate")
      .populate(
        "entertainer",
        "stageName profileImage entertainerType location",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Shortlisted applications fetched successfully",
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Updating the status of the application
export const updateApplicationStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const barId = req.user.sub;
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!barId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ message: "Invalid token" });
    }

    const allowedStatuses = ["shortlisted", "accepted", "rejected"];
    if (!allowedStatuses.includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await EventApplication.findById(applicationId)
      .populate("event")
      .populate("entertainer")
      .session(session);

    if (!application) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Application not found" });
    }

    if (!application.event || application.event.bar.toString() !== barId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: "You are not allowed to update this application",
      });
    }

    const currentStatus = application.status;

    const validTransitions = {
      pending: ["shortlisted", "rejected"],
      shortlisted: ["accepted", "rejected"],
      accepted: [],
      rejected: [],
    };

    if (!validTransitions[currentStatus].includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Cannot change status from ${currentStatus} to ${status}`,
      });
    }

    // Normal update if not accepted
    if (status !== "accepted") {
      application.status = status;
      await application.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Application status updated successfully",
        application,
      });
    }

    // If accepted:
    // 1. Accept selected application
    application.status = "accepted";
    await application.save({ session });

    // 2. Change event status to in_progress
    await Event.findByIdAndUpdate(
      application.event._id,
      {
        status: "in_progress",
        selectedEntertainer: application.entertainer._id,
      },
      { new: true, session },
    );

    // 3. Reject all other pending/shortlisted applications for same event
    await EventApplication.updateMany(
      {
        event: application.event._id,
        _id: { $ne: application._id },
        status: { $in: ["pending", "shortlisted"] },
      },
      {
        $set: { status: "rejected" },
      },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    // 4. Send email after transaction succeeds
    if (application.entertainer?.email) {
      await sendApplicationEmail(
        application.entertainer.email,
        application.event.title,
        application.event.eventDate,
      );
    }

    return res.status(200).json({
      message:
        "Application accepted successfully, event moved to in_progress, and other applications rejected",
      application,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
