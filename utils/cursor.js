import mongoose from "mongoose";
import AnonymousReview from "../models/anonymousReview.js";

export const loadCommentsCursor = async (
    eventId,
    { cursorCreatedAt = null, cursorId = null, limit = 5, entertainerId = null } = {},
) => {
    limit = Number(limit);

    if (!Number.isFinite(limit) || limit < 1 || limit > 100) {
        throw new Error("Invalid limit");
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new Error("Invalid eventId");
    }

    const query = {
        event: new mongoose.Types.ObjectId(eventId),
        moderationStatus: "visible",
        comment: { $exists: true, $ne: "" },
    };

    if (entertainerId) {
        if (!mongoose.Types.ObjectId.isValid(entertainerId)) {
            throw new Error("Invalid entertainerId");
        }

        query.entertainer = new mongoose.Types.ObjectId(entertainerId);
    }

    // Load older comments
    if (cursorCreatedAt && cursorId) {
        query.$or = [
            { createdAt: { $lt: new Date(cursorCreatedAt) } },
            {
                createdAt: new Date(cursorCreatedAt),
                _id: { $lt: new mongoose.Types.ObjectId(cursorId) },
            },
        ];
    }

    const comments = await AnonymousReview.find(query)
        .select("comment reviewerLabel overallRating createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .lean();

    const hasNextPage = comments.length > limit;

    if (hasNextPage) comments.pop();

    const lastComment = comments[comments.length - 1];

    return {
        comments,
        nextCursor:
            hasNextPage && lastComment
                ? {
                    cursorCreatedAt: lastComment.createdAt,
                    cursorId: lastComment._id,
                }
                : null,
        hasNextPage,
    };
};
