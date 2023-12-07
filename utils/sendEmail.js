const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
// Create a transporter with your SMTP server settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Replace with your SMTP host
  port: 587, // Replace with your SMTP port
  secure: false, // For TLS or SSL support (true for 465 port, false for other ports)
  auth: {
    user: 'localbusiness318@gmail.com', // Replace with your email address
    pass: 'shahd123', // Replace with your email password or app password
  },
 
});

// Email content/options
const mailOptions = {
  from: 'local App <localbusiness318@gmail.com>',
  to: options.email,
  subject: options.subject,
  text: options.message,
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error occurred:', error);
  } else {
    console.log('Email sent successfully!');
  }
});
};
module.exports = sendEmail;