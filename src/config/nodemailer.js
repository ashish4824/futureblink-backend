const nodemailer = require('nodemailer');
// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
// Verify the transporter
transporter.verify((error) => {
  if (error) {
    console.error('Error with email transporter:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

module.exports = transporter;