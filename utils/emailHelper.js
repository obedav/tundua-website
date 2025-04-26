const { sendMail } = require('../config/mailer');

/**
 * Helper function to send emails
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.text] - Email plain text content
 * @returns {Promise<Object>} - Result of sending email
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Tundua Edu Consult <info@tundua.com>',
      to: options.to,
      subject: options.subject,
      html: options.html
    };
    
    // Add plain text version if provided
    if (options.text) {
      mailOptions.text = options.text;
    }
    
    return await sendMail(mailOptions);
  } catch (error) {
    console.error('Error in sendEmail helper:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { sendEmail };