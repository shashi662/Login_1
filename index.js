const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./Routes/Auth");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
  });
  next();
});

app.use((req, res, next) => {
  console.log("hitting middleware");
  next();
}, authRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

app.use((req, res, next, error) => {
  if (error) {
    return new Error(error.message);
  }
  next();
});
mongoose
  .connect(
    `mongodb+srv://kumarshashikant05:Ef1w6oESWAwJ5J5c@cluster0.m86kdjb.mongodb.net/users`
  )
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log("connected to db as well as server");
    });
  })
  .catch(() => console.log("not connected"));
module.exports = app;
