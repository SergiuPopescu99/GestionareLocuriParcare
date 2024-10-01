import { FormRow, FormRowSelect } from "../components";
import Wrapper from "../assets/wrappers/DashboardFormPage";
import { useState } from "react";
import {
  PARK_STATUS,
  PARK_TYPE,
  PARK_PAID_STATUS,
} from "../../../utils/constants";
import {
  Form,
  useNavigation,
  redirect,
  useLoaderData,
  useParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";

export const loader = async ({ params }) => {
  try {
    const { data } = await customFetch.get(`/parking-spots/${params.id}`);

    return data;
  } catch (err) {
    toast.error(err?.response?.data?.msg);
    redirect("/dashboard/all-parkingspots");
  }
};

const EditJob = () => {
  const [image, setImage] = useState(null);
  const params = useParams();
  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const editSpotData = new FormData(event.target);

      if (image && image.size > 0) {
        const formData = new FormData();
        formData.append("file", image);

        const response = await fetch("azure storage", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();

          const imageURL = data.imageUrl;

          editSpotData.append("image", imageURL);
          const dataForm = Object.fromEntries(editSpotData);

          await customFetch.patch(`/parking-spots/${params.id}`, dataForm);

          toast.success("Parking edited!!");
        } else {
          toast.error("Error uploading image,try again");
        }
      } else if (!image || image.size === 0) {
        editSpotData.delete("image");
        const dataForm = Object.fromEntries(editSpotData);
        console.log(dataForm);
        await customFetch.patch(`/parking-spots/${params.id}`, dataForm);

        toast.success("Parking edited!!");
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg);
    }
  };
  const { parkingSpot } = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  return (
    <Wrapper>
      <Form className="form" method="post" onSubmit={handleSubmit}>
        <h4 className="form-title">Edit Parking spot</h4>
        <div className="form-center">
          <FormRow
            type="text"
            name="location"
            defaultValue={parkingSpot.location}
          />
          <FormRowSelect
            labelText="status"
            name="status"
            defaultValue={parkingSpot.status}
            list={Object.values(PARK_STATUS)}
          />
          <FormRowSelect
            labelText="type"
            name="type"
            defaultValue={parkingSpot.type}
            list={Object.values(PARK_TYPE)}
          />
          <FormRowSelect
            labelText="Paid Status"
            name="paidStatus"
            defaultValue={parkingSpot.paidStatus}
            list={Object.values(PARK_PAID_STATUS)}
          />
          <div className="form-row">
            <label htmlFor="image" className="form-label">
              Image
            </label>
            <input
              type="file"
              name="image"
              id="image"
              className="form-input"
              onChange={handleImageChange}
            />
          </div>
          <button
            type="submit"
            className="btn btn block form-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "submitting..." : "submit"}
          </button>
        </div>
      </Form>
    </Wrapper>
  );
};
export default EditJob;
