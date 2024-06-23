import { FormRow, FormRowSelect } from "../components";
import Wrapper from "../assets/wrappers/DashboardFormPage";
import { useOutletContext } from "react-router-dom";
import React, { useState } from "react";
import {
  PARK_PAID_STATUS,
  PARK_TYPE,
  PARK_STATUS,
} from "../../../utils/constants";
import { Form, useNavigation, redirect } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";

const AddParkingSpot = () => {
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const addSpotData = new FormData(event.target);

      // If image is present, upload it
      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const response = await fetch(
          "https://uploadparkpal.azurewebsites.net/api/uploadImagePark?code=Ug39TFdFmUlt-LJFzRKOJ-i_CFuxxe6BLdLcf-BkVKagAzFuy5_4RA==",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Error uploading image");
        }

        const data = await response.json();
        const imageURL = data.imageUrl;
        addSpotData.append("image", imageURL);
        const dataForm = Object.fromEntries(addSpotData);
        await customFetch.post("/parking-spots", dataForm);
      } else {
        const dataForm = Object.fromEntries(addSpotData);
        delete dataForm.image;
        await customFetch.post("/parking-spots", dataForm);
        toast.success("Parking spot created!");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { user } = useOutletContext();
  const { role } = user;

  if (role !== "admin") {
    redirect("/dashboard");
    return null;
  }

  return (
    <Wrapper>
      <Form
        method="post"
        className="form"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
      >
        <h4 className="form-title">Add Parking Spot</h4>
        <div className="form-center">
          <FormRow type="text" name="location" />
          <FormRowSelect
            labelText="status"
            name="status"
            defaultValue={PARK_STATUS.AVAILABLE}
            list={Object.values(PARK_STATUS)}
          />
          <FormRowSelect
            labelText="type"
            name="type"
            defaultValue={PARK_TYPE.STANDARD}
            list={Object.values(PARK_TYPE)}
          />
          <FormRowSelect
            labelText="Paid Status"
            name="paidStatus"
            defaultValue={PARK_PAID_STATUS.UNPAID}
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
            className="btn btn-block form-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting" : "Submit"}
          </button>
        </div>
      </Form>
    </Wrapper>
  );
};

export default AddParkingSpot;
