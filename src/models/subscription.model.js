import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({}, { timeStamps: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
