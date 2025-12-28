import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiresponse.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { removeFileFromCloudinary } from "../utils/removeFileFromCloundinary.js";
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
const upadteVideo = asyncHandler(async (req, res) => {
  const { video_id } = req.params;
  console.log("video _ id", video_id);
  const prev_Video = await Video.findById(video_id);

  if (!prev_Video) {
    throw new apiError(400, "video not exist ");
  }

  const prevPath = prev_Video?.videoFile;

  const localPath = req.file?.path;

  const cloudinaryPath = await uploadFileOnCloudinary(localPath);

  if (!cloudinaryPath) {
    throw new apiError(500, "issue in uploading file on cloudinary");
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    prev_Video?._id,
    {
      $set: {
        videoFile: cloudinaryPath.url,
      },
    },
    {
      new: true,
    }
  );
  await removeFileFromCloudinary(prevPath);

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedVideo, "video file update success fully ")
    );
});
const updateTitleAndDescription = asyncHandler(async (req, res) => {
  const { video_id } = req.params;
  const prev_Video = await Video.findById(video_id);

  if (!prev_Video) {
    throw new apiError(400, "video not exist ");
  }

  const { title, description } = req.body;
  const updatedVideo = await Video.findByIdAndUpdate(
    prev_Video?.id,
    {
      $set: {
        title: title,
        description: description,
      },
    },
    { new: true }
  );

  if (!upadteVideo) {
    throw new apiError(500, "error in updation title & description");
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedVideo,
        "update title & description success fully "
      )
    );
});
const updateThumbnail = asyncHandler(async (req, res) => {
  const { video_id } = req.params;
  const prev_Video = await Video.findById(video_id);

  if (!prev_Video) {
    throw new apiError(400, "video not exist ");
  }

  const prevPath = prev_Video?.thumbnail;

  const localPath = req.file?.path;

  const cloudinaryPath = await uploadFileOnCloudinary(localPath);

  if (!cloudinaryPath) {
    throw new apiError(500, "issue in uploading file on cloudinary");
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    prev_Video?._id,
    {
      $set: {
        thumbnail: cloudinaryPath.url,
      },
    },
    {
      new: true,
    }
  );
  await removeFileFromCloudinary(prevPath);

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedVideo, "video file update success fully ")
    );
});

export {
  uploadVideo,
  deleteVideo,
  upadteVideo,
  updateTitleAndDescription,
  updateThumbnail,
};
