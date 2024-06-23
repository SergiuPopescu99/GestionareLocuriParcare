import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";
import { redirect } from "react-router-dom";

export const action = async ({ params }) => {
  try {
    await customFetch.delete(`/parking-spots/${params.id}`);
    toast.success("Successfully deleted!");
  } catch (err) {
    toast.error(err?.response?.data?.msg);
  }
  return redirect("/dashboard");
};
const DeleteParkingSpot = () => {
  return <div>DeleteParkingSpot</div>;
};

export default DeleteParkingSpot;
