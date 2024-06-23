import {
  FaLocationArrow,
  FaBriefcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaParking,
  FaMoneyBillAlt,
  FaDollarSign,
} from "react-icons/fa";
import { Link, Form } from "react-router-dom";
import Wrapper from "../assets/wrappers/Job";
import ParkInfo from "./ParkInfo";

import day from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
day.extend(advancedFormat);
const ParkingSpot = ({
  _id,
  location,
  status,
  type,
  paidStatus,
  image,
  createdAt,
  price,
}) => {
  const date = day(createdAt).format("MMM Do, YYYY");

  // Definirea icon-urilor în funcție de informațiile primite
  const getStatusIcon = () => {
    return status === "available" ? (
      <FaCheckCircle color="green" />
    ) : (
      <FaTimesCircle color="red" />
    );
  };

  const getTypeIcon = () => {
    return type === "standard" ? <FaParking /> : <FaParking color="gold" />;
  };

  const getPaidStatusIcon = () => {
    return paidStatus === "unpaid" ? (
      <FaMoneyBillAlt />
    ) : (
      <FaMoneyBillAlt color="green" />
    );
  };

  return (
    <Wrapper>
      <header>
        <div className="main-icon">{<FaParking />}</div>
        <div className="info">
          <h5>{location}</h5>
        </div>
      </header>
      <div className="content">
        <div className="content-center">
          <ParkInfo icon={<FaCalendarAlt />} text={date} />
          <ParkInfo icon={<FaDollarSign />} text={price}></ParkInfo>
          <ParkInfo icon={getTypeIcon()} text={type} />
          <ParkInfo icon={getPaidStatusIcon()} text={paidStatus} />
          <div className={`status ${status}`}>{status}</div>
        </div>
        <footer className="actions">
          <Link className="btn edit-btn" to={`/dashboard/parkingspots/${_id}`}>
            View
          </Link>
          <Link to={`/dashboard/edit-parking/${_id}`} className="btn edit-btn">
            Edit
          </Link>
          <Form method="post" action={`/dashboard/delete-parking/${_id}`}>
            <button type="submit" className="btn delete-btn">
              Delete
            </button>
          </Form>
        </footer>
      </div>
    </Wrapper>
  );
};

export default ParkingSpot;
