import ParkingSpot from "./ParkingSpot";
import Wrapper from "../assets/wrappers/JobsContainer";
import { useAllParkingSpotsContext } from "../pages/AllParkingSpots";
import PageBtnContainer from "./PageBtnContainer";
const ParkingSpotsContainer = () => {
  const { data } = useAllParkingSpotsContext();
  const { parkingSpots, totalParkingSpots, numOfPages } = data;
  if (parkingSpots.length === 0) {
    return (
      <Wrapper>
        <h2>No parking spots to display...</h2>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <h5>
        {totalParkingSpots} Parking Spot{parkingSpots.length > 1 ? "s" : ""}
      </h5>
      <div className="jobs">
        {parkingSpots.map((spot) => {
          return <ParkingSpot key={spot._id} {...spot} />;
        })}
      </div>
      {numOfPages > 1 && <PageBtnContainer />}
    </Wrapper>
  );
};

export default ParkingSpotsContainer;
