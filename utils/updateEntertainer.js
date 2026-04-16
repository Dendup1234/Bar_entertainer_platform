import AnonymousReview from "../models/anonymousReview.js";
import Entertainer from "../models/entertainer.js";

export const updateEntertainerRating = async (entertainerId) => {
  const stats = await AnonymousReview.aggregate([
    {
      $match: {
        entertainer: entertainerId,
        moderationStatus: "visible",
      },
    },
    {
      $group: {
        _id: "$entertainer",
        averageRating: { $avg: "$overallRating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats.length > 0 ? stats[0].averageRating : 0;
  const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

  await Entertainer.findByIdAndUpdate(entertainerId, {
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews,
  });
};
