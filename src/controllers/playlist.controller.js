import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiresponse.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
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
  ).populate("videos");

  if (!updatedPlaylist) {
    throw new apiError(500, "failed to add video in playlist");
  }
  return res
    .status(200)
    .json(new apiResponse(200, updatedPlaylist, "video added successfully "));
});
export { createPlaylist, addVideoToPlaylist };
