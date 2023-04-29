const express = require("express");
const router = express.Router();
const {
  Signin,
  Signup,
  ForgotPassword,
  ResetPassword,
} = require("../Controller/Auth");

router.post("/signin", Signin);

router.post("/signup", Signup);

router.post("/forgotPassword", ForgotPassword);

router.post("/resetPassword/:resetToken", ResetPassword);

module.exports = router;
