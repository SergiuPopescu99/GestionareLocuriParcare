import { FormRow, FormRowSelect } from ".";
import Wrapper from "../assets/wrappers/DashboardFormPage";
import { useSubmit, Form, Link, useNavigation } from "react-router-dom";
import {
  PARK_STATUS,
  PARK_TYPE,
  PARK_PAID_STATUS,
  PARK_SORT_BY,
} from "../../../utils/constants";
import { useAllParkingSpotsContext } from "../pages/AllParkingSpots";
const SearchContainer = () => {
  const { searchValues } = useAllParkingSpotsContext();
  const { search, status, type, sort } = searchValues;
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const debounce = (onChange) => {
    let timeout;
    return (e) => {
      const form = e.currentTarget.form;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        onChange(form);
      }, 2000);
    };
  };
  return (
    <Wrapper>
      <Form className="form">
        <h5 className="form-title">search form</h5>
        <div className="form-center">
          <FormRow
            type="search"
            name="search"
            defaultValue={search}
            onChange={(e) => {
              submit(e.currentTarget.form);
            }}
          />
          <FormRowSelect
            labelText="park status"
            name="status"
            list={["all", ...Object.values(PARK_STATUS)]}
            defaultValue={status}
            onChange={(e) => {
              submit(e.currentTarget.form);
            }}
          />
          <FormRowSelect
            labelText="park type"
            name="type"
            list={["all", ...Object.values(PARK_TYPE)]}
            defaultValue={type}
            onChange={debounce((form) => {
              submit(form);
            })}
          />
          <FormRowSelect
            labelText="sort"
            name="sort"
            defaultValue={sort}
            list={[...Object.values(PARK_SORT_BY)]}
            onChange={(e) => {
              submit(e.currentTarget.form);
            }}
          />
          <Link to="/dashboard" className="btn form-btn delete-btn">
            Reset Search Values
          </Link>
        </div>
      </Form>
    </Wrapper>
  );
};

export default SearchContainer;
