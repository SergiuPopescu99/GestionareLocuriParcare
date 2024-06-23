import { toast } from "react-toastify";
import { ParkingSpotsContainer, SearchContainer } from "../components";
import customFetch from "../utils/customFetch";
import { useLoaderData } from "react-router-dom";
import { useContext, createContext } from "react";

export const loader = async ({ request }) => {
  try {
    console.log(request.url);
    const params = Object.fromEntries([
      ...new URL(request.url).searchParams.entries(),
    ]);
    console.log(params);
    const { data } = await customFetch.get("/parking-spots", { params });

    console.log(data);
    return { data, searchValues: { ...params } };
  } catch (err) {
    toast.error(err?.response?.data?.msg);
    return err;
  }
};
const AllParkingSpotsContext = createContext();
const AllParkingSpots = () => {
  const { data, searchValues } = useLoaderData();
  return (
    <AllParkingSpotsContext.Provider value={{ data, searchValues }}>
      <SearchContainer />
      <ParkingSpotsContainer />
    </AllParkingSpotsContext.Provider>
  );
};
export const useAllParkingSpotsContext = () =>
  useContext(AllParkingSpotsContext);
export default AllParkingSpots;
