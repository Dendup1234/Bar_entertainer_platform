import Entertainer from "../../models/entertainer.js";
import mongoose from "mongoose";
//Getting all the agent in the employee dashboard
export const getAllEntertainer = async (req, res) => {
  try {
    const entertainers = await Entertainer.aggregate([
      {
        $match: {
          isActive: true,
          isVerified: true,
          availabilityStatus: "available",
        },
      },

      // Join reviews
      {
        $lookup: {
          from: "anonymousreviews",
          localField: "_id",
          foreignField: "entertainer",
          as: "reviews",
        },
      },

      // Join bookings
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "entertainer",
          as: "bookings",
        },
      },

      // Compute values
      {
        $addFields: {
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.overallRating" }, 1] },
              0,
            ],
          },
          reviewCount: { $size: "$reviews" },

          bookingCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "booking",
                cond: { $eq: ["$$booking.status", "accepted"] },
              },
            },
          },

          latestComment: {
            $let: {
              vars: {
                validComments: {
                  $filter: {
                    input: "$reviews",
                    as: "review",
                    cond: {
                      $and: [
                        { $ne: ["$$review.comment", null] },
                        { $ne: ["$$review.comment", ""] },
                        { $eq: ["$$review.moderationStatus", "visible"] },
                      ],
                    },
                  },
                },
              },
              in: {
                $cond: [
                  { $gt: [{ $size: "$$validComments" }, 0] },
                  {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $slice: [
                              {
                                $sortArray: {
                                  input: "$$validComments",
                                  sortBy: { createdAt: -1 },
                                },
                              },
                              1,
                            ],
                          },
                          as: "item",
                          in: "$$item.comment",
                        },
                      },
                      0,
                    ],
                  },
                  "",
                ],
              },
            },
          },
        },
      },

      // Final response fields
      {
        $project: {
          _id: 1,
          profileImage: 1,
          stageName: 1,
          entertainerType: 1,
          genres: 1,
          location: 1,
          performanceFeeMin: 1,
          performanceFeeMax: 1,
          isVerified: 1,
          avgRating: 1,
          reviewCount: 1,
          bookingCount: 1,
          latestComment: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Entertainers fetched successfully",
      entertainers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Getting the entertainer profile
export const getEntertainerById = async (req, res) => {
  try {
    const { entertainerId } = req.params;

    const entertainer = await Entertainer.findById(entertainerId);

    if (!entertainer) {
      return res.status(404).json({ message: "Entertainer not found" });
    }

    return res.status(200).json({
      profileImage: entertainer.profileImage,
      stageName: entertainer.stageName,
      email: entertainer.email,

      stats: {
        totalReviews: entertainer.totalReviews,
        averageRating: entertainer.averageRating,
        totalBookings: entertainer.totalBookings,
      },

      bio: {
        entertainerType: entertainer.entertainerType,
        genres: entertainer.genres,
        priceRange: `Nu.${entertainer.performanceFeeMin} - Nu.${entertainer.performanceFeeMax}`,
        availability: entertainer.availableAt,
      },

      experience: entertainer.experiences,

      contact: {
        phone: entertainer.phone,
        location: entertainer.location,
      },

      socialLinks: entertainer.socialLinks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const searchEntertainer = async (req, res) => {
  try {
    const { q } = req.query;

    const entertainers = await Entertainer.aggregate([
      {
        $match: {
          isActive: true,
          isVerified: true,
          availabilityStatus: "available",
          ...(q && {
            stageName: {
              $regex: q,
              $options: "i", // case-insensitive
            },
          }),
        },
      },

      // Join reviews
      {
        $lookup: {
          from: "anonymousreviews",
          localField: "_id",
          foreignField: "entertainer",
          as: "reviews",
        },
      },

      // Join bookings
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "entertainer",
          as: "bookings",
        },
      },

      // Compute values
      {
        $addFields: {
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.overallRating" }, 1] },
              0,
            ],
          },
          reviewCount: { $size: "$reviews" },

          bookingCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "booking",
                cond: { $eq: ["$$booking.status", "accepted"] },
              },
            },
          },

          latestComment: {
            $let: {
              vars: {
                validComments: {
                  $filter: {
                    input: "$reviews",
                    as: "review",
                    cond: {
                      $and: [
                        { $ne: ["$$review.comment", null] },
                        { $ne: ["$$review.comment", ""] },
                        { $eq: ["$$review.moderationStatus", "visible"] },
                      ],
                    },
                  },
                },
              },
              in: {
                $cond: [
                  { $gt: [{ $size: "$$validComments" }, 0] },
                  {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $slice: [
                              {
                                $sortArray: {
                                  input: "$$validComments",
                                  sortBy: { createdAt: -1 },
                                },
                              },
                              1,
                            ],
                          },
                          as: "item",
                          in: "$$item.comment",
                        },
                      },
                      0,
                    ],
                  },
                  "",
                ],
              },
            },
          },
        },
      },

      // Final response
      {
        $project: {
          _id: 1,
          profileImage: 1,
          stageName: 1,
          entertainerType: 1,
          genres: 1,
          location: 1,
          performanceFeeMin: 1,
          performanceFeeMax: 1,
          isVerified: 1,
          avgRating: 1,
          reviewCount: 1,
          bookingCount: 1,
          latestComment: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Entertainers fetched successfully",
      entertainers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
