const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
// Create a transporter with your SMTP server settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 587, 
  secure: false, 
  auth: {
    user: 'localbusiness318@gmail.com', 
    pass: 'shahd123', 
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