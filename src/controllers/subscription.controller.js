import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiresponse.js";
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new apiError(400, "channelId must require");
  }
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new apiError(400, "channelId must be valid");
  }

  const existingUser = User.findById(channelId);
  if (!existingUser) {
    throw new apiError(400, "Channel not exist");
  }
  // if you want to strict check use new mongoose.Types.ObjectId(channelId) === req.user._id
  if (channelId == req.user._id) {
    throw new Error("You cannot subscribe to your own channel");
  }

  const subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  if (subscription) {
    await Subscription.deleteOne({ _id: subscription._id });
    return res
      .status(200)
      .json(
        new apiResponse(200, { subscribed: false }, "unSubscribe successfully ")
      );
  } else {
    await Subscription.create({ channel: channelId, subscriber: req.user._id });
    return res
      .status(200)
      .json(
        new apiResponse(200, { subscribed: true }, "Subscribed successfully ")
      );
  }
});

export { toggleSubscription };
