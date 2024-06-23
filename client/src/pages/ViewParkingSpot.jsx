import React, { useState, useEffect } from "react";
import { useParams, useNavigate, redirect } from "react-router-dom";
import { toast } from "react-toastify";
import ReactMapGL, { Marker } from "react-map-gl";
import customFetch from "../utils/customFetch";
import { useLoaderData } from "react-router-dom";
import Wrapper from "../assets/wrappers/ViewParkingSpot";

import {
  FaLocationArrow,
  FaBriefcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaParking,
  FaMoneyBillAlt,
} from "react-icons/fa";

export const loader = async ({ params }) => {
  try {
    const response = await customFetch.get(`/parking-spots/${params.id}`);
    return response.data;
  } catch (err) {
    toast.error("Failed to load parking spot");
    return redirect("/dashboard/all-parkingspots");
  }
};

const ViewParkingSpot = () => {
  const navigate = useNavigate();
  const { parkingSpot } = useLoaderData();
  console.log(parkingSpot);
  const [viewport, setViewport] = useState({
    width: 400,
    height: 400,
    latitude: parkingSpot ? parkingSpot.geometry.coordinates[1] : 0,
    longitude: parkingSpot ? parkingSpot.geometry.coordinates[0] : 0,
    zoom: 8,
  });

  useEffect(() => {
    if (!parkingSpot) {
      toast.error("Parking spot not found!");
      navigate("/dashboard/all-parkingspots");
    } else {
      setViewport({
        width: "100%",
        height: "100%",
        latitude: parkingSpot.geometry.coordinates[1],
        longitude: parkingSpot.geometry.coordinates[0],
        zoom: 12,
      });
    }
  }, [parkingSpot, navigate]);

  return (
    <Wrapper>
      <div className="wrapper">
        <div className="details-section">
          <p>{parkingSpot.location}</p>
          <p>
            <FaParking /> Type: {parkingSpot.type}
          </p>
          <p>
            <FaCheckCircle /> Status: {parkingSpot.status}
          </p>
          <p>
            <FaMoneyBillAlt /> Paid Status: {parkingSpot.paidStatus}
          </p>
          {parkingSpot.image && (
            <img
              src={parkingSpot.image}
              alt="Parking Spot"
              className="spot-image"
            />
          )}
        </div>
        <div className="map-container">
          <ReactMapGL
            {...viewport}
            mapStyle="mapbox://styles/mapbox/light-v10"
            onViewportChange={(nextViewport) => setViewport(nextViewport)}
            mapboxAccessToken="pk.eyJ1IjoicG9waWNhOTkiLCJhIjoiY2xkNTE1OWtoMDBvNDN1bWcyZGlqNW9oOSJ9.7ip35xa4DPAQnkME2lIlRw"
          >
            <Marker latitude={viewport.latitude} longitude={viewport.longitude}>
              <div>
                <span role="img" aria-label="pin">
                  📍
                </span>
              </div>
            </Marker>
          </ReactMapGL>
        </div>
      </div>
    </Wrapper>
  );
};

export default ViewParkingSpot;
