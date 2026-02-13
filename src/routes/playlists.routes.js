import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylistById,
  getPLaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);
// not tested yet test once completed all route
router.route("/create-playlist").post(createPlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").delete(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

router
  .route("/:playlistId")
  .get(getPLaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylistById);

export default router;
