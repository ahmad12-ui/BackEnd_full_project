import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannel,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();

router.route("/toggle-subscribe/:channelId").get(verifyJWT, toggleSubscription);
router
  .route("/get-subscriber/:channelId")
  .get(verifyJWT, getUserChannelSubscribers);
router
  .route("/get-subscribeb-channel/:subscriberId")
  .get(verifyJWT, getSubscribedChannel);

export default router;
