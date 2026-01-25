import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const parsedLimit = Number(limit);
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

  const findAll = Comment.find({
    video: new mongoose.Types.ObjectId(videoId),
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parsedLimit);

  if (!findAll) {
    throw new apiError(500, "failed to find all comments");
  }
  return res
    .status(200)
    .json(new apiResponse(200, findAll, "comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const text = req.body.content?.trim();

  if (!text) throw new apiError(400, "content is required");
  if (text.length > 280) throw new apiError(400, "tweet too long");

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
  const createComment = await Comment.create({
    owner: req.user._id,
    content: text,
    video: videoId,
  })
    .populate("owner", "name avatar")
    .sort({ createdAt: -1 });

  // if (!createComment) {
  //   throw new apiError(400, "failed to write comment");
  // }
  return res
    .status(200)
    .json(new apiResponse(201, createComment, "comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const text = req.body.content?.trim();

  if (!text) throw new apiError(400, "content is required");
  if (text.length > 280) throw new apiError(400, "tweet too long");
  if (!commentId) {
    throw new apiError(400, "commentId must require");
  }
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new apiError(400, "commentId must be valid");
  }
  const existing = await Comment.exists({ _id: commentId });
  if (!existing) {
    throw new apiError(404, "comment not existing ");
  }

  const updated = await Comment.findByIdAndUpdate(
    commentId,
    { owner: req.user._id },
    { content: text },
    { new: true }
  );
  if (!updated) {
    throw new apiError(500, "failed to update");
  }
  return res
    .status(200)
    .json(new apiResponse(200, updated, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new apiError(400, "videoId must require");
  }
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new apiError(400, "videoId must be valid");
  }
  const existing = await Comment.exists({ _id: commentId });
  if (!existing) {
    throw new apiError(404, "comment not existing ");
  }
  const deleted = await Comment.findByIdAndDelete(commentId);

  if (!deleted) {
    throw new apiError(500, "failed to delete the comment");
  }
  return res
    .status(200)
    .json(new apiResponse(200, deleted, "comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
