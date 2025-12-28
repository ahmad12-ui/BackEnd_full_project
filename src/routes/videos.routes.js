import { Router } from "express";
import {
  deleteVideo,
  upadteVideo,
  updateThumbnail,
  uploadVideo,
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
// router.route("/update-video/:video_id").get(verifyJWT, upadteVideo);
router
  .route("/update-video/:video_id")
  .patch(verifyJWT, upload.single("videoFile"), upadteVideo);
router
  .route("/update-thumbnail/:video_id")
  .patch(verifyJWT, upload.single("thumbnail"), updateThumbnail);

export default router;
