import jwt from "jsonwebtoken";
const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  //Options for cookies
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  const { password, ...userData } = user._doc;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    userData,
  });
};

export default sendToken;
