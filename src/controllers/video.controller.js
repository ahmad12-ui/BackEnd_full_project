import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiresponse.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { removeFileFromCloudinary } from "../utils/removeFileFromCloundinary.js";
import mongoose from "mongoose";
// import { User } from "../models/user.model.js";
const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (
    [title, description, videoFileLocalPath, thumbnailLocalPath].some(
      (field) => field.trim() === ""
    )
  ) {
    throw new apiError(400, "all field must require");
  }

  const existingTitle = Video.find({ title: title });
  if (!existingTitle) {
    throw new apiError(400, "title must be unique");
  }

  const videoFileCloudinary = await uploadFileOnCloudinary(videoFileLocalPath);
  const thumbnailCloudinary = await uploadFileOnCloudinary(thumbnailLocalPath);

  console.log("this is video file", videoFileCloudinary);

  if (!videoFileCloudinary || !thumbnailCloudinary) {
    throw new apiError(400, "files must be required");
  }
  console.log(req.user._id);
  const publishVideo = await Video.create({
    title,
    description,
    duration: videoFileCloudinary.duration,
    videoFile: videoFileCloudinary.url,
    thumbnail: thumbnailCloudinary.url,
    owner: req.user?._id,
  });
  await Video.populate("owner", "userName email avatar");
  console.log("owner", publishVideo.owner);
  if (!publishVideo) {
    throw new apiError("500", "there is issue in create video ");
  }
  return res
    .status(200)
    .json(new apiResponse(200, publishVideo, "video Creation is successful "));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { video_id } = req.params;

  const response = await Video.deleteOne({ _id: video_id });
  if (!response) {
    throw new apiError(400, "video_id must required to delete video");
  }

  return res
    .status(200)
    .json(new apiResponse(200, response, "video delete successfully "));
});

const updateVideoFile = asyncHandler(async (req, res) => {
  const { video_id } = req.params;
  const current_video = await Video.findById(video_id);

  if (!current_video) {
    throw new apiError(400, "video not exist ");
  }
  const { title, description } = req.body;

  const { videoFile, thumbnail } = req.files;
  let videolocalPath;
  if (videoFile) {
    videolocalPath = videoFile[0].path;
  }
  let thumbnailLocalPath;
  if (thumbnail) {
    thumbnailLocalPath = thumbnail[0].path;
  }
  var videoFileCloudinary;
  if (videolocalPath) {
    videoFileCloudinary = await uploadFileOnCloudinary(videolocalPath);
  }
  var thumbnailCloudinary;
  if (thumbnailLocalPath) {
    thumbnailCloudinary = await uploadFileOnCloudinary(thumbnailCloudinary);
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    current_video?._id,
    {
      $set: {
        title: title,
        description: description,
        videoFile: videoFileCloudinary?.url,
        duration: videoFileCloudinary?.duration,
        thumbnail: thumbnailCloudinary?.url,
      },
    },
    { new: true }
  );

  if (!updatedVideo) {
    throw new apiError(500, "issue in updation the video");
  }
  return res
    .status(200)
    .json(new apiResponse(200, updatedVideo, "video updated success full"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { video_id } = req.params;

  const selectedVideo = await Video.findById(video_id).select("-isPublished");

  if (!selectedVideo) {
    throw new apiError(400, "Video ID must required to get this");
  }
  return res
    .status(200)
    .json(new apiResponse(200, selectedVideo, "video fetched success fully"));
});

const toggleIsPublished = asyncHandler(async (req, res) => {
  const { video_id } = req.params;

  const toggledValue = await Video.findByIdAndUpdate(
    video_id,
    [
      {
        $set: {
          isPublished: { $not: "$isPublished" },
        },
      },
    ],
    { new: true, updatePipeline: true }
  );
  console.log("toggled value", toggledValue);
  if (!toggledValue) {
    throw new apiError(400, "Invalid video Id ");
  }
  return res
    .status(200)
    .json(
      new apiResponse(200, toggledValue, "isPublished toggled successfully ")
    );
});

// get all video of specific user
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortType, userId, query } = req.query;

  if (!userId) {
    throw new apiError(400, "userId must require");
  }
  if (!query || !page || !sortType) {
    throw new apiError(400, "some parameter is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new apiError(400, "userId must be valid");
  }
  let sortId = sortType == "desc" ? -1 : 1;
  const aggregation = Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        isPublished: true,
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    },
    {
      $sort: {
        createdAt: sortId,
      },
    },
    {
      $project: {
        title: 1,
        videoFile: 1,
        description: 1,
        views: 1,
        createdAt: 1,
      },
    },
  ]);
  const options = {
    page: Number(page),
    limit: Number(limit),
  };
  const allVideos = await Video.aggregatePaginate(aggregation, options);
  if (!allVideos) {
    throw new apiError(500, "failed to found ");
  }
  return res
    .status(200)
    .json(new apiResponse(200, allVideos, "videos fetched successfully"));
});

// get all user based on query , get all user from id

export {
  uploadVideo,
  deleteVideo,
  updateVideoFile,
  getVideoById,
  toggleIsPublished,
  getAllVideos,
};
