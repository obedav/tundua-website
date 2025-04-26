require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing email configuration...');
console.log('Environment variables:');
console.log('- EMAIL_USER:', process.env.EMAIL_USER || 'undefined');
console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'CONFIGURED' : 'NOT CONFIGURED');
console.log('- ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'Not set');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Email credentials missing in environment variables');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log('Attempting to verify SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP verification error:', error);
  } else {
    console.log('SMTP server is ready to send mail');
    
    // Try sending a test email
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Tundua Test Email',
      text: 'This is a test email to verify the email configuration is working.'
    }, (err, info) => {
      if (err) {
        console.error('Failed to send email:', err);
      } else {
        console.log('Test email sent successfully!', info.messageId);
      }
    });
  }
});