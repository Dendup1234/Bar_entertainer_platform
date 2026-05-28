import mongoose from "mongoose";
import Event from "../../models/event.js";
import AnonymousReview from "../../models/anonymousReview.js";
import { loadCommentsCursor } from "../../utils/cursor.js";

export const getEntertainerReviewTable = async (req, res) => {
  try {
    const entertainerId = req.user.sub;

    if (!mongoose.Types.ObjectId.isValid(entertainerId)) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const entertainerObjectId = new mongoose.Types.ObjectId(entertainerId);

    const data = await Event.aggregate([
      {
        $match: {
          selectedEntertainer: entertainerObjectId,
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
      message: "Entertainer review table fetched successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getEntertainerReviewProfileById = async (req, res) => {
  try {
    const entertainerId = req.user.sub;
    const { eventId } = req.params;
    const {
      cursorCreatedAt = null,
      cursorId = null,
      limit = 5,
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(entertainerId)) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const entertainerObjectId = new mongoose.Types.ObjectId(entertainerId);

    const event = await Event.findOne({
      _id: eventId,
      selectedEntertainer: entertainerObjectId,
    })
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

    const eventObjectId = new mongoose.Types.ObjectId(eventId);

    const statsResult = await AnonymousReview.aggregate([
      {
        $match: {
          event: eventObjectId,
          entertainer: entertainerObjectId,
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
      event: eventObjectId,
      entertainer: entertainerObjectId,
      moderationStatus: "visible",
      comment: { $exists: true, $ne: "" },
    });

    const commentResult = await loadCommentsCursor(eventId, {
      cursorCreatedAt,
      cursorId,
      limit,
      entertainerId,
    });

    return res.status(200).json({
      message: "Entertainer event profile fetched successfully",
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
