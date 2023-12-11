const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter with your SMTP server settings
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'localbusiness318@gmail.com',
      pass: 'gpjz sugf axhj zvxm',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Email content/options
  const mailOptions = {
    from: 'local App <localbusiness318@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!', info);
    return info;
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

module.exports = sendEmail;
