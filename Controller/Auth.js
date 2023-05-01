const sendMail = require("../Services/MailService");
const User = require("../Model/UserSchema");

const Signin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next("Please Provide credentials");
  }

  const data = await User.findOne({ email: email }).select("-__v +password");

  const isPasswordMatched = data.comparePassword(password);

  if (!isPasswordMatched) {
    res.status(404).json({
      success: "false",
      message: "Invalid credentials",
      data: {},
      error: {
        statusCode: 404,
        message: "Please enter valid credentials",
      },
    });
  }
  const jwtToken = data.createJWTToken();
  res.status(201).json({
    success: "true",
    message: "Wow, Login successful",
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
  if (!name || !email || !password || !confirmPassword) {
    return res.status(404).json({
      success: "false",
      message: "Please enter correct credentials",
      data: {},
      error: {
        statusCode: 404,
        message: "Some Credentials are missing",
      },
    });
  }
  if (password !== confirmPassword) {
    return res.status(404).json({
      success: "false",
      message: "Please enter correct credentials",
      data: {},
      error: {
        statusCode: 404,
        message: "Password and confirm password are not same",
      },
    });
  }
  User.create({ name, email, password, confirmPassword })
    .then((user) => {
      return res.status(201).json({
        success: "true",
        message: "Wow, Signup successful",
        data: {},
      });
    })
    .catch((err) => {
      return res.status(404).json({
        success: "false",
        message: err.message,
        data: {},
        error: {
          statusCode: 404,
          message: err.message,
        },
      });
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

  const resetUrl = `${req.protocol}://${req.hostname}/3000/resetPassword/${user.resetPasswordToken}`;
  const body = `Please click on URL ${resetUrl} to reset password`;
  sendMail(email, body);

  res.send("Hello World");
};

const ResetPassword = async (req, res, next) => {
  // console.log("Hitting desired root");
  const { resetToken } = req.params;

  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  // console.log(user);
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
