import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userHistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    enum: ["reserve", "release"],
    required: true,
  },
  parkingSpotId: {
    type: Schema.Types.ObjectId,
    ref: "ParkingSpot",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
userHistorySchema.methods.calculatePrice = function (parkingRate) {
  let totalPrice = 0;
  let lastReleaseTime = null;

  // Sortează evenimentele de parcare după timestamp
  this.parkingEvents.sort((a, b) => a.timestamp - b.timestamp);

  // Iterează prin fiecare eveniment de parcare
  for (const event of this.parkingEvents) {
    if (event.type === "reserve") {
      // Dacă este o rezervare, salvați timpul rezervării
      const reserveTime = event.timestamp;
      // Găsește următorul eveniment de eliberare
      const nextRelease = this.parkingEvents.find(
        (e) => e.timestamp > reserveTime && e.type === "release"
      );
      // Verifică dacă s-a găsit un eveniment de eliberare ulterior
      if (nextRelease) {
        const releaseTime = nextRelease.timestamp;
        // Calculați durata parcarei și prețul corespunzător
        const duration = releaseTime - reserveTime;
        const price = duration * parkingRate;
        totalPrice += price;
        lastReleaseTime = releaseTime;
      }
    }
  }

  return totalPrice;
};

const UserHistory = model("UserHistory", userHistorySchema);

export default UserHistory;
