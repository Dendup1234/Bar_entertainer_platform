import crypto from "crypto";
import Event from "../../models/event.js";
import QRReviewToken from "../../models/qrReviewToken.js";
import AnonymousReview from "../../models/anonymousReview.js";
import { updateEntertainerRating } from "../../utils/updateEntertainer.js";
import { loadCommentsCursor } from "../../utils/cursor.js";
import mongoose from "mongoose";
// Generate a review token
export const generateReviewToken = async (req, res) => {
  try {
    const barId = req.user.sub;
    const { eventId } = req.params;

    if (!barId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const event = await Event.findOne({
      _id: eventId,
      bar: barId,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.selectedEntertainer) {
      return res.status(400).json({
        message:
          "You can only generate a review QR after selecting an entertainer",
      });
    }

    if (!event.startTime || !event.endTime) {
      return res.status(400).json({
        message: "Event start time and end time are required",
      });
    }

    if (event.status === "cancelled") {
      return res.status(400).json({
        message: "Cannot generate review QR for a cancelled event",
      });
    }
    if (event.status === "completed") {
      return res.status(400).json({
        message: "Cannot generate review QR for an event that is completed",
      });
    }

    const rawToken = crypto.randomBytes(24).toString("hex");
    const reviewUrl = `${process.env.FRONTEND_URL}/review/${rawToken}`;

    const qrToken = await QRReviewToken.create({
      event: event._id,
      bar: barId,
      entertainer: event.selectedEntertainer,
      token: rawToken,
      validFrom: event.startTime,
      validUntil: event.endTime,
      isActive: true,
    });

    return res.status(201).json({
      message: "Review token generated successfully",
      qrTokenId: qrToken._id,
      token: qrToken.token,
      reviewUrl,
      validFrom: qrToken.validFrom,
      validUntil: qrToken.validUntil,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Regenerate a review token
export const regenerateReviewToken = async (req, res) => {
  try {
    const barId = req.user.sub;
    const { eventId } = req.params;

    if (!barId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const event = await Event.findOne({
      _id: eventId,
      bar: barId,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.selectedEntertainer) {
      return res.status(400).json({
        message: "No selected entertainer found for this event",
      });
    }

    await QRReviewToken.updateMany(
      {
        event: event._id,
        isActive: true,
      },
      {
        $set: { isActive: false },
      },
    );

    const rawToken = crypto.randomBytes(24).toString("hex");
    const reviewUrl = `${process.env.FRONTEND_URL}/review/${rawToken}`;

    const qrToken = await QRReviewToken.create({
      event: event._id,
      bar: barId,
      entertainer: event.selectedEntertainer,
      token: rawToken,
      validFrom: event.startTime,
      validUntil: event.endTime,
      isActive: true,
    });

    return res.status(201).json({
      message: "Review token regenerated successfully",
      qrTokenId: qrToken._id,
      token: qrToken.token,
      reviewUrl,
      validFrom: qrToken.validFrom,
      validUntil: qrToken.validUntil,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// token validation
export const getReviewPageByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const qrToken = await QRReviewToken.findOne({ token, isActive: true })
      .populate("event", "title eventDate startTime endTime status")
      .populate("entertainer", "stageName profileImage entertainerType");

    if (!qrToken) {
      return res.status(404).json({ message: "Invalid or inactive token" });
    }

    const now = new Date();
    console.log(now);

    if (now < qrToken.validFrom || now > qrToken.validUntil) {
      return res.status(400).json({
        message: "This QR review link is not active right now",
      });
    }

    return res.status(200).json({
      message: "Review token is valid",
      event: qrToken.event,
      entertainer: qrToken.entertainer,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Submiting the reviews from the qr code
export const submitAnonymousReview = async (req, res) => {
  try {
    const { token } = req.params;
    const {
      performanceRating,
      professionalismRating,
      crowdEngagementRating,
      comment,
      deviceId,
    } = req.body;

    const qrToken = await QRReviewToken.findOne({
      token,
      isActive: true,
    });

    if (!qrToken) {
      return res.status(404).json({ message: "Invalid review token" });
    }

    const now = new Date();
    if (now < qrToken.validFrom || now > qrToken.validUntil) {
      return res.status(400).json({
        message: "Review submission is no longer available",
      });
    }

    if (!deviceId) {
      return res.status(400).json({
        message: "Device ID is required",
      });
    }

    // Validate rating fields
    const ratings = [
      performanceRating,
      professionalismRating,
      crowdEngagementRating,
    ];

    const hasMissingRating = ratings.some(
      (rating) => rating === undefined || rating === null,
    );

    if (hasMissingRating) {
      return res.status(400).json({
        message:
          "Performance, professionalism, and crowd engagement ratings are required",
      });
    }

    const hasInvalidRating = ratings.some(
      (rating) => typeof rating !== "number" || rating < 1 || rating > 5,
    );

    if (hasInvalidRating) {
      return res.status(400).json({
        message: "All ratings must be numbers between 1 and 5",
      });
    }

    // Calculate overall rating automatically
    const overallRating = Number(
      (
        (performanceRating + professionalismRating + crowdEngagementRating) /
        3
      ).toFixed(1),
    );

    const deviceHash = crypto
      .createHash("sha256")
      .update(deviceId)
      .digest("hex");

    const existingReview = await AnonymousReview.findOne({
      qrToken: qrToken._id,
      deviceHash,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "This device has already submitted a review",
      });
    }

    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "";

    const review = await AnonymousReview.create({
      event: qrToken.event,
      bar: qrToken.bar,
      entertainer: qrToken.entertainer,
      qrToken: qrToken._id,
      overallRating,
      performanceRating,
      professionalismRating,
      crowdEngagementRating,
      comment,
      reviewerLabel: "Anonymous attendee",
      deviceHash,
      ipAddress,
    });

    await updateEntertainerRating(qrToken.entertainer);

    return res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate review from this device",
      });
    }

    return res.status(500).json({ message: error.message });
  }
};

// Getting event entertainer review table
export const getEventEntertainerReviewTable = async (req, res) => {
  try {
    const barId = req.user.sub;

    const data = await Event.aggregate([
      {
        $match: {
          bar: new mongoose.Types.ObjectId(barId),
          selectedEntertainer: { $ne: null },
        },
      },

      {
        $lookup: {
          from: "entertainers",
          localField: "selectedEntertainer",
          foreignField: "_id",
          as: "entertainer",
        },
      },
      {
        $unwind: "$entertainer",
      },

      {
        $lookup: {
          from: "anonymousreviews",
          let: {
            eventId: "$_id",
            entertainerId: "$selectedEntertainer",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$event", "$$eventId"] },
                    { $eq: ["$entertainer", "$$entertainerId"] },
                    { $eq: ["$moderationStatus", "visible"] },
                  ],
                },
              },
            },
          ],
          as: "reviews",
        },
      },

      {
        $addFields: {
          noOfReviews: { $size: "$reviews" },
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.overallRating" }, 2] },
              0,
            ],
          },
        },
      },

      {
        $project: {
          _id: 1,
          entertainerId: "$entertainer._id",
          entertainer: "$entertainer.stageName",
          type: "$entertainer.entertainerType",
          eventName: "$title",
          eventType: {
            $cond: ["$isPublic", "Public", "Private"],
          },
          noOfReviews: 1,
          avgRating: 1,
        },
      },

      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.status(200).json({
      message: "Event entertainer review table fetched successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

// Getting event profile by id
export const getEventProfileById = async (req, res) => {
  try {
    const { eventId } = req.params;

    const {
      cursorCreatedAt = null,
      cursorId = null,
      limit = 5,
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const event = await Event.findById(eventId)
      .populate(
        "selectedEntertainer",
        "stageName name entertainerType profileImage averageRating totalReviews",
      )
      .select(
        "title bannerImageUrl description isPublic selectedEntertainer entertainerTypeNeeded genresPreferred eventDate startTime endTime venueAddress city status",
      )
      .lean();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const statsResult = await AnonymousReview.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(eventId),
          moderationStatus: "visible",
        },
      },
      {
        $group: {
          _id: "$event",
          totalReviews: { $sum: 1 },
          overallRating: { $avg: "$overallRating" },
          performanceQuality: { $avg: "$performanceRating" },
          crowdEngagement: { $avg: "$crowdEngagementRating" },
          professionalism: { $avg: "$professionalismRating" },
        },
      },
      {
        $project: {
          _id: 0,
          totalReviews: 1,
          overallRating: { $round: ["$overallRating", 1] },
          performanceQuality: { $round: ["$performanceQuality", 1] },
          crowdEngagement: { $round: ["$crowdEngagement", 1] },
          professionalism: { $round: ["$professionalism", 1] },
        },
      },
    ]);

    const stats = statsResult[0] || {
      totalReviews: 0,
      overallRating: 0,
      performanceQuality: 0,
      crowdEngagement: 0,
      professionalism: 0,
    };

    const totalComments = await AnonymousReview.countDocuments({
      event: eventId,
      moderationStatus: "visible",
      comment: { $exists: true, $ne: "" },
    });

    const commentResult = await loadCommentsCursor(eventId, {
      cursorCreatedAt,
      cursorId,
      limit,
    });

    return res.status(200).json({
      message: "Event profile fetched successfully",
      data: {
        event: {
          _id: event._id,
          eventName: event.title,
          description: event.description,
          image: event.bannerImageUrl,
          eventType: event.isPublic ? "Public" : "Private",
          eventDate: event.eventDate,
          startTime: event.startTime,
          endTime: event.endTime,
          venueAddress: event.venueAddress,
          city: event.city,
          status: event.status,
          entertainerRequirement: event.entertainerTypeNeeded,
          genresPreferred: event.genresPreferred,
        },

        selectedEntertainer: event.selectedEntertainer,

        ratings: {
          totalReviews: stats.totalReviews,
          overallRating: stats.overallRating,
          performanceQuality: stats.performanceQuality,
          crowdEngagement: stats.crowdEngagement,
          professionalism: stats.professionalism,
        },

        comments: {
          total: totalComments,
          limit: Number(limit),
          hasNextPage: commentResult.hasNextPage,
          nextCursor: commentResult.nextCursor,
          data: commentResult.comments,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
