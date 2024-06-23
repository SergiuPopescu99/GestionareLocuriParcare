import dayjs from "dayjs";
import cron from "node-cron";
import Booking from "../models/bookingModel.js";
import ParkingSpot from "../models/parkModel.js";
const checkExpiredBookings = async () => {
  try {
    const now = dayjs().toDate();
    const expiredBookings = await Booking.find({
      endTime: { $lt: now },
      status: "booked",
    });
    for (const booking of expiredBookings) {
      booking.status = "completed";
      await booking.save();
      const parkingSpot = await ParkingSpot.findById(booking.parkingSpot);
      if (parkingSpot) {
        parkingSpot.status = "available";
        await parkingSpot.save();
      }
    }
  } catch (err) {
    console.error(err);
  }
};
const checkNewBookings = async () => {
  try {
    const now = dayjs().toDate();
    const newBookings = await Booking.find({
      startTime: { $lte: now },
      status: "booked",
    });
    for (const booking of newBookings) {
      const parkingSpot = await ParkingSpot.findById(booking.parkingSpot);
      if (parkingSpot) {
        parkingSpot.status = "occupied";
        await parkingSpot.save();
      }
    }
  } catch (err) {
    console.log(err);
  }
};

cron.schedule("*/1 * * * *", checkExpiredBookings);
cron.schedule("*/1 * * * *", checkNewBookings);
