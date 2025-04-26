// api.js
const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const Newsletter = require('../models/Newsletter');
const Testimonial = require('../models/Testimonial');
const Location = require('../models/Location');
const Submission = require('../models/Submission');
const nodemailer = require('nodemailer');

// Create a transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-email-password'
    }
  });
};

// Send email function
const sendEmail = async (mailOptions) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error.message,
      note: 'Form submission processed successfully despite email failure'
    };
  }
};

// Contact form submission
// In api.js, modify your contact endpoint
router.post('/contact', async (req, res) => {
  try {
    console.log('Contact form submission received:', req.body);
    const { name, email, phone, subject, message } = req.body;
    
    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, and message.' 
      });
    }

    // Log the phone value specifically
    console.log('Phone value received:', phone);

    // Create and save inquiry to database
    const newInquiry = new Inquiry({
      name,
      email,
      phone: phone || 'Not provided', // Make sure phone is saved
      subject: subject || 'No Subject',
      message,
      status: 'new',
      date: new Date() // Add a proper date field
    });
    
    console.log('Saving inquiry with data:', {
      name,
      email,
      phone: phone || 'Not provided',
      subject: subject || 'No Subject',
      date: new Date()
    });
    
    await newInquiry.save();
    console.log('Inquiry saved to database with ID:', newInquiry._id);

    // Send email notification
    const emailResult = await sendEmail({
      to: process.env.ADMIN_EMAIL || 'info@tundua.com',
      subject: `New Contact Form Submission: ${subject || 'No Subject'}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    // Return success response
    res.status(200).json({ 
      success: true, 
      message: 'Your message has been sent successfully!',
      emailStatus: emailResult.success ? 'delivered' : 'queued'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your request.' 
    });
  }
});

// Newsletter subscription
router.post('/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ success: false, message: 'Email already subscribed' });
    }
    
    // Save to database
    const subscriber = new Newsletter({ email });
    await subscriber.save();
    
    console.log('New subscriber added:', email); // Add this line for debugging
    
    res.status(200).json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true });
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Testimonials error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all study locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true });
    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    console.error('Locations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Questionnaire form submission route - support both endpoint paths
router.post('/submit-questionnaire', async (req, res) => {
  console.log('Received questionnaire submission');
  console.log('Request body:', req.body);
  
  try {
      const {
          // Personal Information
          firstName, lastName, email, phone, dob, nationality, address,
          
          // Academic Background
          highestQualification, graduationYear, institution, fieldOfStudy, gpa, 
          englishTest, englishScore,
          
          // Study Preferences
          studyLevel, intendedMajor, studyCountry, university, intakeDate, budget,
          
          // Additional Details
          experience, extracurricular, goals, additionalInfo,
          
          // From URL params (if any)
          referredSchool, referredCourse
      } = req.body;
      
      // Validate required fields
      if (!firstName || !lastName || !email || !phone) {
          console.log('Missing required fields:', { firstName, lastName, email, phone });
          return res.status(400).json({
              success: false,
              message: 'Please fill in all required fields'
          });
      }
      
      // Create new submission
      const newSubmission = new Submission({
          // Personal Information
          firstName, 
          lastName, 
          email, 
          phone, 
          dob: dob || 'Not provided', 
          nationality: nationality || 'Not provided', 
          address: address || 'Not provided',
          
          // Academic Background
          highestQualification: highestQualification || 'Not provided', 
          graduationYear: graduationYear || 'Not provided', 
          institution: institution || 'Not provided', 
          fieldOfStudy: fieldOfStudy || 'Not provided', 
          gpa: gpa || 'Not provided',
          englishTest: englishTest || 'Not specified',
          englishScore: englishScore || 'Not specified',
          
          // Study Preferences
          studyLevel: studyLevel || 'Not provided', 
          intendedMajor: intendedMajor || 'Not provided', 
          studyCountry: studyCountry || 'Not provided',
          university: university || 'Not specified',
          intakeDate: intakeDate || 'Not provided', 
          budget: budget || 'Not provided',
          
          // Additional Details
          experience: experience || 'Not specified',
          extracurricular: extracurricular || 'Not specified',
          goals: goals || 'Not specified',
          additionalInfo: additionalInfo || 'Not specified',
          
          // Referral data (if any)
          referredSchool: referredSchool || '',
          referredCourse: referredCourse || ''
      });
      
      console.log('Saving submission:', newSubmission);
      
      // Save to database
      await newSubmission.save();
      console.log('Submission saved successfully');
      
      // Send emails - handle each email independently
      try {
        // Send confirmation to user first - this is most important for user experience
        const userEmailResult = await sendEmail({
          to: email,
          subject: 'Thank you for your submission - Tundua Edu Consult',
          html: `
            <h3>Dear ${firstName},</h3>
            <p>Thank you for submitting your study abroad questionnaire. Our team at Tundua Edu Consult will review your information and contact you within 24-48 hours to discuss the next steps.</p>
            <p>Best regards,<br>Tundua Edu Consult Team</p>
          `
        });
        
        if (userEmailResult.success) {
          console.log('Confirmation email sent to user');
        } else {
          console.log('Failed to send confirmation email to user:', userEmailResult.error);
        }
        
        // Admin notification - independent of user email success
        const adminEmailResult = await sendEmail({
          to: process.env.ADMIN_EMAIL || 'info@tundua.com',
          subject: 'New Study Abroad Questionnaire Submission',
          html: `
            <h3>New Questionnaire Submission from ${firstName} ${lastName}</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Intended Major:</strong> ${intendedMajor || 'Not specified'}</p>
            <p><strong>Desired Study Level:</strong> ${studyLevel || 'Not specified'}</p>
            <p><strong>Preferred Country:</strong> ${studyCountry || 'Not specified'}</p>
            <p><strong>Intake Date:</strong> ${intakeDate || 'Not specified'}</p>
            <p>Please check the admin dashboard for full details.</p>
          `
        });
        
        if (adminEmailResult.success) {
          console.log('Admin notification email sent');
        } else {
          console.log('Failed to send admin notification email:', adminEmailResult.error);
        }
      } catch (emailError) {
        console.error('Email sending failed, but form submission was successful:', emailError);
        // Continue with success response even if email fails
      }
      
      // Send success response regardless of email status
      res.status(200).json({
        success: true,
        message: 'Your questionnaire has been submitted successfully. We will contact you soon!'
      });
    } catch (error) {
      console.error('Questionnaire submission error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred. Please try again later.',
        error: error.message
      });
    }
});

// Add this route to your existing api.js file
router.post('/newsletter-subscribe', async (req, res) => {
    console.log('Newsletter subscription request received:', req.body);
    
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required'
        });
      }
      
      // Check if email already exists
      const existingSubscriber = await Newsletter.findOne({ email });
      if (existingSubscriber) {
        // If already subscribed but inactive, reactivate
        if (!existingSubscriber.active) {
          existingSubscriber.active = true;
          existingSubscriber.date = new Date();
          await existingSubscriber.save();
          
          console.log('Reactivated existing subscriber:', email);
          
          return res.status(200).json({
            success: true,
            message: 'Your subscription has been reactivated!'
          });
        }
        
        console.log('Email already subscribed:', email);
        
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed to our newsletter!'
        });
      }
      
      // Create new subscription
      const newSubscriber = new Newsletter({
        email,
        active: true,
        date: new Date()
      });
      
      await newSubscriber.save();
      console.log('New newsletter subscriber saved:', email);
      
      // Send confirmation email
      try {
        await sendEmail({
          to: email,
          subject: 'Welcome to Tundua Edu Consult Newsletter',
          html: `
            <h3>Thank you for subscribing!</h3>
            <p>You will now receive our latest updates on study abroad opportunities and trends.</p>
            <p>Best regards,<br>Tundua Edu Consult Team</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Continue with success response even if email fails
      }
      
      res.status(200).json({
        success: true,
        message: 'Thank you for subscribing to our newsletter!'
      });
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred. Please try again later.'
      });
    }
});

// Add this route for newsletter unsubscribe via API
router.post('/newsletter/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }
    
    // Find the subscriber
    const subscriber = await Newsletter.findOne({ email });
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email address not found in our subscription list'
      });
    }
    
    // If already inactive
    if (!subscriber.active) {
      return res.status(200).json({
        success: true,
        message: 'You are already unsubscribed from our newsletter'
      });
    }
    
    // Update subscriber status to inactive
    subscriber.active = false;
    await subscriber.save();
    
    // Send confirmation email
    try {
      await sendEmail({
        to: email,
        subject: 'Unsubscribed from Tundua Edu Consult Newsletter',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <img src="https://tundua.com/img/logo.png" alt="Tundua Edu Consult" style="max-width: 200px;">
            </div>
            <div style="padding: 20px;">
              <h3>You have been unsubscribed</h3>
              <p>We're sorry to see you go. You have been successfully unsubscribed from our newsletter.</p>
              <p>If you change your mind, you can <a href="https://tundua.com/newsletter-preferences?email=${email}">resubscribe here</a>.</p>
              <p>Best regards,<br>Tundua Edu Consult Team</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
              <p>© ${new Date().getFullYear()} Tundua Edu Consult. All rights reserved.</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send unsubscribe confirmation email:', emailError);
      // Continue with success response even if email fails
    }
    
    res.status(200).json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter'
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.'
    });
  }
});

module.exports = router;