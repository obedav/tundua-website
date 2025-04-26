// Updated email configuration for tundua-backend
// File: config/mailer.js

const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // Option 1: Google SMTP (Requires app password)
  const googleTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com', 
      pass: process.env.EMAIL_PASS || 'your-app-password' // Use app password, not regular password
    },
    tls: {
      rejectUnauthorized: false // Accept self-signed certificates
    }
  });

  // Option 2: Alternative - Use a more permissive email service like SendGrid, Mailgun, etc.
  // const alternativeTransporter = nodemailer.createTransport({
  //   service: 'SendGrid', // or 'Mailgun', etc.
  //   auth: {
  //     user: process.env.SENDGRID_USER,
  //     pass: process.env.SENDGRID_PASS
  //   }
  // });

  return googleTransporter; // or alternativeTransporter
};

// Wrapper function that handles email errors gracefully
const sendMail = async (mailOptions) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    // Log error but don't crash the application
    return { 
      success: false, 
      error: error.message,
      note: 'Form submission processed successfully despite email failure'
    };
  }
};

module.exports = { sendMail };