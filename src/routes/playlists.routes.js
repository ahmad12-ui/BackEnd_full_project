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
router.use(verifyJWT);
// not tested yet test once completed all route
router.route("/create-playlist").post(createPlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

router
  .route("/:playlistId")
  .get(getPLaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylistById);

export default router;
