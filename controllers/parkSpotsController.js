import ParkingSpot from "../models/parkModel.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/customError.js";
import mongoose from "mongoose";
import day from "dayjs";
import jwt from "jsonwebtoken";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding.js";
import SavedSpot from "../models/savedSpotModel.js";
import Booking from "../models/bookingModel.js";

let geocoder;
const initializeGeocoder = () => {
  const mapBoxToken = process.env.MAPBOX_TOKEN;
  if (!geocoder && mapBoxToken) {
    geocoder = mbxGeocoding({ accessToken: mapBoxToken });
  }
};

export const getAllParkingSpots = async (req, res) => {
  const { search, status, type, sort, minPrice, maxPrice } = req.query;
  const queryObject = {};
  if (search) {
    queryObject.$or = [{ location: { $regex: search, $options: "i" } }];
  }
  if (status && status !== "all") {
    queryObject.status = status;
  }
  if (type && type !== "all") {
    queryObject.type = type;
  }
  if (minPrice) {
    queryObject.price = {
      ...(queryObject.price || {}),
      $gte: Number(minPrice),
    };
  }
  if (maxPrice) {
    queryObject.price = {
      ...(queryObject.price || {}),
      $lte: Number(maxPrice),
    };
  }
  const sortOptions = {
    newest: "-createdAt",
    oldest: "createdAt",
  };
  const sortKey = sortOptions[sort] || sortOptions["newest"];
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const parkingSpots = await ParkingSpot.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);
  const totalParkingSpots = await ParkingSpot.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalParkingSpots / limit);
  return res
    .status(StatusCodes.OK)
    .json({ numOfPages, currentPage: page, totalParkingSpots, parkingSpots });
};

export const createParkingSpot = async (req, res) => {
  try {
    initializeGeocoder();

    req.body.createdBy = req.user;
    const geoData = await geocoder
      .forwardGeocode({
        query: req.body.location,
        limit: 1,
      })
      .send();

    req.body.geometry = geoData.body.features[0].geometry;
    const park = await ParkingSpot.create({ ...req.body });
    console.log(park);
    return res.status(StatusCodes.CREATED).json({ park });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Server error" });
  }
};

export const editParkingSpot = async (req, res) => {
  try {
    const id = String(req.params.id);
    initializeGeocoder();
    const geoData = await geocoder
      .forwardGeocode({
        query: req.body.location,
        limit: 1,
      })
      .send();
    req.body.geometry = geoData.body.features[0].geometry;
    const updatedParkingSpot = await ParkingSpot.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    return res
      .status(StatusCodes.OK)
      .json({ msg: "Parking spot modified", updatedParkingSpot });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Server error" });
  }
};
export const deleteParkingSpot = async (req, res) => {
  const id = String(req.params.id);
  await Booking.deleteMany({ parkingSpot: id });
  await SavedSpot.deleteMany({ parkingSpot: id });
  const parkingSpot = await ParkingSpot.findByIdAndDelete(id);

  return res
    .status(StatusCodes.OK)
    .json({ msg: "Parking spot  deleted", parkingSpot });
};

export const getParkingSpot = async (req, res) => {
  const id = req.params.id;

  const parkingSpot = await ParkingSpot.findById(id).populate("createdBy");

  const token = req.cookies?.token;
  console.log(token);
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
      if (!err) {
        const saved = await SavedSpot.findOne({
          user: payload.id,
          parkingSpot: id,
        });
        console.log(saved);
        return res
          .status(200)
          .json({ parkingSpot, isSaved: saved ? true : false });
      }
    });
  } else {
    return res.status(StatusCodes.OK).json({ parkingSpot, isSaved: false });
  }
};

export const showStats = async (req, res) => {
  let stats = await ParkingSpot.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const defaultStats = {
    available: 0,
    occupied: 0,
    reserved: 0,
  };

  stats.forEach((stat) => {
    if (stat._id === "available") {
      defaultStats.available = stat.count;
    } else if (stat._id === "occupied") {
      defaultStats.occupied = stat.count;
    } else if (stat._id === "reserved") {
      defaultStats.reserved = stat.count;
    }
  });
  let monthlyData = await ParkingSpot.aggregate([
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 },
    },
    {
      $limit: 6,
    },
  ]);
  monthlyData = monthlyData
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = day()
        .month(month - 1)
        .year(year)
        .format("MMM YY");
      return { date, count };
    })
    .reverse();
  res.status(StatusCodes.OK).json({ defaultStats, monthlyData });
};
