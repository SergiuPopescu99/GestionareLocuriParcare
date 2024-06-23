import { ChartsContainer, StatsContainer } from "../components";
import customFetch from "../utils/customFetch";
import { useLoaderData } from "react-router-dom";
export const loader = async () => {
  try {
    const response = await customFetch.get("/parking-spots/stats");
    return response.data;
  } catch (error) {
    return error;
  }
};

const Stats = () => {
  const { defaultStats, monthlyData } = useLoaderData();
  console.log(monthlyData);
  return (
    <>
      <StatsContainer defaultStats={defaultStats} />
      {monthlyData?.length > 0 && <ChartsContainer data={monthlyData} />}
    </>
  );
};
export default Stats;
