import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const text = req.body.content?.trim();

  if (!text) throw new apiError(400, "content is required");
  if (text.length > 280) throw new apiError(400, "tweet too long");

  const tweet = await Tweet.create({
    owner: req.user._id,
    content: text,
  });

  return res
    .status(201)
    .json(new apiResponse(201, tweet, "tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const { userId } = req.params;
  if (!userId) {
    throw new apiError(400, "videoId must require");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new apiError(400, "videoId must be valid");
  }
  const existing = await User.exists({ _id: userId });
  if (!existing) {
    throw new apiError(404, "user not existing ");
  }
  const parsedLimit = Number(limit);
  const getAllTweets = await Tweet.find({
    owner: new mongoose.Types.ObjectId(userId),
    isDeleted: false,
  })
    .skip((page - 1) * limit)
    .limit(parsedLimit)
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new apiResponse(200, getAllTweets, "fetched all tweet successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const text = req.body.content?.trim();

  if (!text) throw new apiError(400, "content is required");
  if (text.length > 280) throw new apiError(400, "tweet too long");
  if (!tweetId) {
    throw new apiError(400, " tweetId must require");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new apiError(400, " tweetId must be valid");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { owner: req.user._id },
    { content: text },
    { new: true }
  );

  if (!updatedTweet) {
    throw new apiError(500, "failed to update");
  }
  return res
    .status(200)
    .json(new apiResponse(200, updateTweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new apiError(400, " tweetId must require");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new apiError(400, " tweetId must be valid");
  }
  const deleted = await Tweet.findByIdAndDelete(tweetId);

  if (!deleted) {
    throw new apiError(500, "failed to delete tweet");
  }
  return res
    .status(200)
    .json(new apiResponse(200, deleted, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
