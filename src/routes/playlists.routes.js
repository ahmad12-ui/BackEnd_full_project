import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylistById,
  getPLaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller";

const router = Router();

// not tested yet test once completed all route
router.route("/create-playlist").post(verifyJWT, createPlaylist);
router.route("/add-video").patch(verifyJWT, addVideoToPlaylist);
router.route("/get-user-playlists").get(verifyJWT, getUserPlaylists);
router.route("/get-playlist").get(verifyJWT, getPLaylistById);
router.route("/remove-video").get(verifyJWT, removeVideoFromPlaylist);
router.route("/delete-playlist").delete(verifyJWT, deletePlaylistById);
router.route("/update-playlist").patch(verifyJWT, updatePlaylist);

export default router;
