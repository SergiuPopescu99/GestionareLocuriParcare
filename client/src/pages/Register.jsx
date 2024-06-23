import { Form, redirect, useNavigation, Link } from "react-router-dom";
import Wrapper from "../assets/wrappers/RegisterAndLoginPage";
import Logo from "../components/Logo";
import { FormRow } from "../components";
import customFetch from "../utils/customFetch";
import { toast } from "react-toastify";
export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    await customFetch.post("/auth/register", data);

    toast.success(`Email send for activation on ${data.email}!`);
    return redirect("/login");
  } catch (err) {
    toast.error(err?.response?.data?.msg);
    return err;
  }
};
const Register = () => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  return (
    <Wrapper>
      <Form method="post" className="form">
        <Logo className="logo" />
        <h4>Register</h4>
        <FormRow type="text" name="name" defaultValue="sergiu" />
        <FormRow
          type="text"
          name="lastName"
          defaultValue="popescu"
          labelText="Last Name"
        />
        <FormRow type="location" name="location" defaultValue="earth" />
        <FormRow type="email" name="email" defaultValue="sergiu@yahoo.com" />
        <FormRow type="password" name="password" defaultValue="default123" />
        <button type="submit" disabled={isSubmitting} className="btn btn-block">
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        <p>
          Already a member?
          <Link to="/login" className="member-btn">
            Login
          </Link>
        </p>
      </Form>
    </Wrapper>
  );
};

export default Register;
