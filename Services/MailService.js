const nodemailer = require("nodemailer");

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.HOST_EMAIL,
    pass: process.env.HOST_PASSWORD,
  },
});

async function sendMail(userEmail, body) {
  let mailDetails = {
    from: process.env.HOST_EMAIL,
    to: userEmail,
    subject: "Test mail",
    text: `${body}`,
  };

  mailTransporter.sendMail(mailDetails, function (err) {
    if (err) {
      console.log(err);
      console.log("Error Occurs");
    } else {
      console.log("Email sent successfully");
    }
  });
}
module.exports = sendMail;
