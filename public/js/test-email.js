// test-email.js
// Run this script to test your email configuration
// Use: node test-email.js

// Load environment variables
require('dotenv').config();

// Import the email service
const { sendEmail } = require('./emailService');

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('Using email settings:');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER);
  console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? '******** (configured)' : 'NOT CONFIGURED');
  console.log('- ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'Not set, will use default');
  
  try {
    // Send a test email
    const result = await sendEmail({
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Tundua Email Test',
      html: `
        <h3>Email Test</h3>
        <p>This is a test email to verify your Tundua application's email configuration.</p>
        <p>If you received this email, your email configuration is working correctly!</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
      `
    });
    
    console.log('Email test completed!');
    console.log('Result:', result);
    
    if (result.success) {
      console.log('✅ SUCCESS: Email was sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('❌ ERROR: Failed to send email.');
      console.log('Error details:', result.error);
    }
  } catch (error) {
    console.error('Unhandled error during email test:', error);
  }
}

// Run the test
testEmail();