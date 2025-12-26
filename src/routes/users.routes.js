import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOut,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
  updateDetails,
  updateFiles,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// secured route

router.route("/logout").post(verifyJWT, logOut);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentUserPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-details").patch(verifyJWT, updateDetails);
router.route("/update-files").patch(
  verifyJWT,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateFiles
);
router.route("/c/:userName").get(verifyJWT, getUserChannelProfile);
router.route("/watch-hsitory").get(verifyJWT, getWatchHistory);

export default router;
