const sendMail = require("../Services/MailService");
const User = require("../Model/UserSchema");

const Signin = async (req, res) => {
  const { email, password } = req.body;
  const data = await User.findOne({ email: email }).select("-__v +password");

  const isPasswordMatched = data.comparePassword(password);

  if (!isPasswordMatched) {
    return res.status(404).json({
      status: "fail",
      message: "Please check your entered credentials",
    });
  }
  const jwtToken = data.createJWTToken();
  res.status(201).json({
    status: "success",

    data: {
      id: data._id,
      name: data.name,
      email: data.email,
      jwtToken: jwtToken,
    },
  });
};

const Signup = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  let user;
  try {
    user = await User.create({ name, email, password, confirmPassword });
  } catch (error) {
    return next(new Error("Email already in use"));
  }
  const isPasswordMatched = user.comparePassword(confirmPassword);
  if (!isPasswordMatched) {
    await user.deleteOne();
    return next(new Error("Check both password"));
  }

  res.status(201).json({
    status: "success",
    data: user,
  });
};

const ForgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error("Invalid email"));
  }
  user.generateHash();
  await user.save();
  const resetUrl = `${req.protocol}://${req.hostname}:3000/resetPassword/${user.resetPasswordToken}`;
  const body = `Please click on URL ${resetUrl} to reset password`;
  sendMail(email, body);

  res.send("Hello World");
};

const ResetPassword = async (req, res, next) => {
  console.log("Hitting desired root");
  const { resetToken } = req.params;

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  console.log(user);
  if (!user) {
    return res.status(404).json({
      status: "fail",
      data: "Please try again, Might be this link is expired",
    });
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  sendMail(
    user.email,
    "Congratulations, your password has been changes successfully"
  );
  res.status(201).json({ status: "success" });
};

module.exports = { ResetPassword, ForgotPassword, Signup, Signin };
