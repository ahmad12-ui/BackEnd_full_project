import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiresponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new apiError(400, "videoId must require");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new apiError(400, "videoId must be valid");
  }
  const existing = await Video.exists({ _id: videoId });
  if (!existing) {
    throw new apiError(404, "video not existing ");
  }

  const liked = await Like.findOneAndDelete({
    likedBy: req.user._id,
    video: videoId,
  });

  if (liked) {
    return res
      .status(200)
      .json(new apiResponse(200, { liked: false }, "unliked successfully"));
  }

  await Like.create({ video: videoId, likedBy: req.user._id });

  return res
    .status(200)
    .json(new apiResponse(200, { liked: true }, "Liked successfully"));
});
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new apiError(400, " commentId must require");
  }
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new apiError(400, " commentId must be valid");
  }
  const existing = await Comment.exists({ _id: commentId });
  if (!existing) {
    throw new apiError(404, "Comment no found in comment schema");
  }
  const commentliked = await Like.findOneAndDelete({
    likedBy: req.user._id,
    comment: commentId,
  });

  if (commentliked) {
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { commentToggled: false },
          "comment unliked successfully"
        )
      );
  }

  await Like.create({ comment: commentId, likedBy: req.user._id });

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { commentToggled: true },
        "comment liked successfully"
      )
    );
});
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new apiError(400, " tweetId must require");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new apiError(400, " tweetId must be valid");
  }
  const existing = await Tweet.exists({ _id: tweetId });
  if (!existing) {
    throw new apiError(404, "tweet no found in tweet schema");
  }
  const tweetliked = await Like.findOneAndDelete({
    likedBy: req.user._id,
    tweet: tweetId,
  });

  if (tweetliked) {
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { tweetToggled: false },
          "tweet unliked successfully"
        )
      );
  }

  await Like.create({ tweet: tweetId, likedBy: req.user._id });

  return res
    .status(200)
    .json(
      new apiResponse(200, { tweetToggled: true }, "tweet liked successfully")
    );
});

const getAllLikedVideos = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const parsedLimit = Number(limit);
  const getListofLikedVideo = await Like.find({
    likedBy: req.user._id,
    video: { $ne: null, $exists: true },
  })
    .limit(parsedLimit)
    .sort({ createdAt: -1 })
    .populate("video");

  return res
    .status(200)
    .json(new apiResponse(200, getListofLikedVideo, "fetched liked videos"));
});

export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getAllLikedVideos,
};
