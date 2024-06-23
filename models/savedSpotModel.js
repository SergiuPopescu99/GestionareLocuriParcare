import mongoose from "mongoose";
const { Schema, model } = mongoose;
const savedSpotSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parkingSpot: {
      type: mongoose.Types.ObjectId,
      ref: "ParkingSpot",
      required: true,
    },
  },
  { timestamps: true }
);
const SavedSpot = model("SavedSpot", savedSpotSchema);
export default SavedSpot;
