import { Router } from "express";
import {
  deleteVideo,
  uploadVideo,
  updateVideoFile,
  getVideoById,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/upload-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);
router.route("/delete-video/:video_id").get(verifyJWT, deleteVideo);

router.route("/update-video-file/:video_id").patch(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  updateVideoFile
);

router.route("/get-video/:video_id").get(verifyJWT, getVideoById);
export default router;
