import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiresponse.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!(name && description)) {
    throw new apiError(
      400,
      "name or description must require to create playlist "
    );
  }
  const userId = req.user._id;

  const createdList = await Playlist.create({
    name: name,
    description: description,
    owner: userId,
  });

  if (!createdList) {
    throw new apiError(500, "failed in creating new playlist ");
  }
  return res
    .status(200)
    .json(new apiResponse(200, createdList, "new list successfully created"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!(playlistId && videoId)) {
    throw new apiError(400, "playlist or video must  be required");
  }
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new apiError("400", "Invalid playlist Id");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new apiError("400", "Invalid video Id");
  }
  const existingVideo = await Video.findOne({
    _id: videoId,
  });

  if (!existingVideo) {
    throw new apiError(400, "there is no video present with this ID  ");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { $addToSet: { video: videoId } },
    { new: true }
  ).populate("video");

  if (!updatedPlaylist) {
    throw new apiError(500, "failed to add video in playlist");
  }
  return res
    .status(200)
    .json(new apiResponse(200, updatedPlaylist, "video added successfully "));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new apiError(400, "user Id must require ");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new apiError(400, "user Id must be  valid ");
  }

  const allPlaylists = await Playlist.find({
    owner: new mongoose.Types.ObjectId(userId),
  }).sort({ createdAt: -1 });

  if (!allPlaylists) {
    throw new apiError(500, "failed to find  playlists");
  }

  return res
    .status(200)
    .json(new apiResponse(200, allPlaylists, "playLists fetched successfuly"));
});

const getPLaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new apiError(400, "playlistId must require ");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new apiError(400, "playlistId  must be  valid ");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new apiError(500, "something went wrong while  finding the playlist");
  }

  return res
    .status(200)
    .json(new apiResponse(200, playlist, "playList fetched successfuly"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId && videoId)) {
    throw new apiError(400, "playlist or video must  be required");
  }
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new apiError("400", "Invalid playlist Id");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new apiError("400", "Invalid video Id");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { video: new mongoose.Types.ObjectId(videoId) } },
    { new: true }
  );
  if (!updatedPlaylist) {
    throw new apiError(500, "Internal server Error while removing ");
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedPlaylist, "video remove successfully"));
});

const deletePlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new apiError(400, "playlistId must require ");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new apiError(400, "playlistId  must be  valid ");
  }

  const removedList = await Playlist.findByIdAndDelete(playlistId);

  if (!removedList) {
    throw new apiError(500, "Internal server error while removing");
  }
  return res
    .status(200)
    .json(new apiResponse(200, removedList, "playlist remove successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new apiError(400, "playlistId must require ");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new apiError(400, "playlistId  must be  valid ");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    {
      new: true,
    }
  ).select("-description");

  if (!updatedPlaylist) {
    throw new apiError(
      500,
      "Internal server error while updating the playlist"
    );
  }
  return res
    .status(200)
    .json(
      new apiResponse(200, updatedPlaylist, "playlist update successfully")
    );
});
export {
  createPlaylist,
  addVideoToPlaylist,
  getUserPlaylists,
  getPLaylistById,
  removeVideoFromPlaylist,
  deletePlaylistById,
  updatePlaylist,
};
