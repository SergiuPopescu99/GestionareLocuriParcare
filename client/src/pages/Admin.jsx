import { FaSuitcaseRolling, FaCalendarCheck } from "react-icons/fa";
import {
  FaParking,
  FaBook,
  FaCheckCircle,
  FaTimesCircle,
  FaDollarSign,
} from "react-icons/fa";
import { useLoaderData, redirect } from "react-router-dom";
import customFetch from "../utils/customFetch";
import Wrapper from "../assets/wrappers/StatsContainer";
import { toast } from "react-toastify";
import { StatItem } from "../components";
import { useEffect } from "react";
import { useState } from "react";

export const loader = async () => {
  try {
    const response = await customFetch.get("/user/app-stats");
    return response.data;
  } catch (error) {
    toast.error("You are not authorized to view this page");
    return redirect("/dashboard");
  }
};

const Admin = () => {
  const { users, parkingSpots } = useLoaderData();
  const [bookingStats, setBookingStats] = useState({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  useEffect(() => {
    const getBookingStats = async () => {
      try {
        const response = await customFetch.get("/bookings/stats");
        const { bookingStats, totalRevenue } = response.data;
        setBookingStats(bookingStats || {});
        console.log(bookingStats);
        setTotalRevenue(totalRevenue);
      } catch (err) {
        console.log(err);
      }
    };
    getBookingStats();
  }, []);
  const icons = {
    booked: <FaBook />,
    cancelled: <FaTimesCircle />,
    completed: <FaCheckCircle />,
    revenue: <FaDollarSign />,
  };

  return (
    <Wrapper>
      <StatItem
        title="current users"
        count={users}
        color="#e9b949"
        bcg="#fcefc7"
        icon={<FaSuitcaseRolling />}
      />
      <StatItem
        title="total parkingspots"
        count={parkingSpots}
        color="#647acb"
        bcg="#e0e8f9"
        icon={<FaParking />}
      />
      {Object.entries(bookingStats).map(([key, value]) => (
        <StatItem
          key={key}
          count={value}
          icon={icons[key]}
          title={key.charAt(0).toUpperCase() + key.slice(1)}
          color={
            key === "cancelled"
              ? "#FF4C4C"
              : key === "completed"
              ? "#4CAF50"
              : "#FFC107"
          }
          bcg={
            key === "cancelled"
              ? "#FFE6E6"
              : key === "completed"
              ? "#E6FFE6"
              : "#FFF5E6"
          }
        />
      ))}
      <StatItem
        count={`$${totalRevenue.toFixed(2)}`}
        icon={icons["revenue"]}
        title="Total Revenue"
        color="#4CAF50"
        bcg="#E6FFE6"
      />
    </Wrapper>
  );
};
export default Admin;
