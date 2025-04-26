// emailService.js
const nodemailer = require('nodemailer');

/**
 * Send email using configured transporter
 * @param {Object} options Email options (to, subject, html)
 * @returns {Object} Result with success status and message/error
 */
const sendEmail = async (options) => {
  try {
    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Check if transporter is working
    await transporter.verify();
    
    // Construct mail options
    const mailOptions = {
      from: `"Tundua Edu Consult" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { sendEmail };