// admin-routes.js - Admin panel routes

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

console.log("Admin routes file is being loaded!");

// Import models
const Inquiry = require('../models/Inquiry');
const Newsletter = require('../models/Newsletter');
const Testimonial = require('../models/Testimonial');
const Location = require('../models/Location');
const Submission = require('../models/Submission');

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, // Limit file size to 5MB
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// Middleware to protect admin routes
const adminAuth = (req, res, next) => {
  // In a real app, you would use sessions, JWT, or another authentication method
  const isAdmin = req.session && req.session.isAdmin;
  
  if (isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

// Test route
router.get('/test', (req, res) => {
  res.send('Admin routes are working!');
});

// Admin login page
router.get('/login', (req, res) => {
  console.log('Rendering login template at:', path.join(process.cwd(), 'views', 'admin', 'login.ejs'));
  
  res.render('admin/login', { 
    activeRoute: 'login',
    error: req.query.error ? 'Invalid credentials' : '',
    errors: [],
    success_msg: '',
    error_msg: '',
    user: null
  });
});

// Admin login post
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email });
  
  // In a real app, you would verify against database credentials
  if (email === 'info@tundua.com' && password === 'Gbengobe@1974') {
    req.session.isAdmin = true;
    req.session.user = {
      name: 'Admin User',
      email: email,
      role: 'admin'
    };
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/login?error=1');
  }
});

// Admin logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Update your dashboard route to include inquiry count
// Update the dashboard route to include counts
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Import models if not already imported at the top of the file
    const Inquiry = require('../models/Inquiry');
    const Submission = require('../models/Submission');
    const Newsletter = require('../models/Newsletter');
    
    // Get counts for dashboard
    const inquiryCount = await Inquiry.countDocuments();
    const submissionCount = await Submission.countDocuments();
    const newsletterCount = await Newsletter.countDocuments();
    
    // Get recent submissions
    const recentSubmissions = await Submission.find()
      .sort({ date: -1 })
      .limit(5);
    
    // Get recent inquiries
    const recentInquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.render('admin/dashboard', {
      title: 'Dashboard',
      user: req.session.user,
      counts: {
        inquiries: inquiryCount,
        submissions: submissionCount,
        newsletters: newsletterCount
      },
      recentSubmissions,
      recentInquiries
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Server Error');
  }
});


// Add these routes to your admin-routes.js file

// Get all inquiries
router.get('/inquiries', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const total = await Inquiry.countDocuments();
    const inquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const pages = Math.ceil(total / limit);
    
    res.render('admin/inquiries', {
      title: 'Contact Inquiries',
      inquiries,
      current: page,
      pages,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).send('Server Error');
  }
});

// Get single inquiry
router.get('/inquiries/:id', adminAuth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).send('Inquiry not found');
    }
    
    res.render('admin/inquiry-detail', {
      title: 'Inquiry Details',
      inquiry,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).send('Server Error');
  }
});

// Delete inquiry
router.delete('/inquiries/:id', adminAuth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


router.get('/subscribers', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const subscribers = await Newsletter.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Newsletter.countDocuments();
    const pages = Math.ceil(total / limit);
    
    res.render('admin/subscribers', {  // Change this line from 'admin/newsletter' to 'admin/subscribers'
      activeRoute: 'subscribers',
      subscribers,
      current: page,
      pages,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Delete subscriber
router.delete('/subscribers/:id', adminAuth, async (req, res) => {
  try {
    const subscriber = await Newsletter.findById(req.params.id);
    
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }
    
    await Newsletter.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subscriber deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Testimonials management
router.get('/testimonials', adminAuth, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ _id: -1 });
    res.render('admin/testimonials', { 
      activeRoute: 'testimonials',
      testimonials 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Add testimonial form
router.get('/testimonials/add', adminAuth, (req, res) => {
  res.render('admin/testimonial-form', { 
    activeRoute: 'testimonials',
    testimonial: null 
  });
});

// Add testimonial post
router.post('/testimonials', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, role, testimonial, isActive } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    
    const newTestimonial = new Testimonial({
      name,
      role,
      testimonial,
      image,
      isActive: isActive === 'on'
    });
    
    await newTestimonial.save();
    res.redirect('/admin/testimonials');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Edit testimonial form
router.get('/testimonials/edit/:id', adminAuth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).send('Testimonial not found');
    }
    
    res.render('admin/testimonial-form', { 
      activeRoute: 'testimonials',
      testimonial 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Update testimonial
router.post('/testimonials/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, role, testimonial, isActive } = req.body;
    const testimonialData = {
      name,
      role,
      testimonial,
      isActive: isActive === 'on'
    };
    
    // Only update image if a new one is uploaded
    if (req.file) {
      // Delete old image if exists
      const oldTestimonial = await Testimonial.findById(req.params.id);
      if (oldTestimonial.image) {
        const oldImagePath = path.join(__dirname, '../public', oldTestimonial.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      testimonialData.image = `/uploads/${req.file.filename}`;
    }
    
    await Testimonial.findByIdAndUpdate(req.params.id, testimonialData);
    res.redirect('/admin/testimonials');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Delete testimonial
router.delete('/testimonials/:id', adminAuth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    
    // Delete image file
    if (testimonial.image) {
      const imagePath = path.join(__dirname, '../public', testimonial.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Study locations management
router.get('/locations', adminAuth, async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.render('admin/locations', { 
      activeRoute: 'locations',
      locations 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Add location form
router.get('/locations/add', adminAuth, (req, res) => {
  res.render('admin/location-form', { 
    activeRoute: 'locations',
    location: null 
  });
});

// Add location post
router.post('/locations', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    
    const newLocation = new Location({
      name,
      description,
      image,
      isActive: isActive === 'on'
    });
    
    await newLocation.save();
    res.redirect('/admin/locations');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Edit location form
router.get('/locations/edit/:id', adminAuth, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).send('Location not found');
    }
    
    res.render('admin/location-form', { 
      activeRoute: 'locations',
      location 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Update location
router.post('/locations/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const locationData = {
      name,
      description,
      isActive: isActive === 'on'
    };
    
    // Only update image if a new one is uploaded
    if (req.file) {
      // Delete old image if exists
      const oldLocation = await Location.findById(req.params.id);
      if (oldLocation.image) {
        const oldImagePath = path.join(__dirname, '../public', oldLocation.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      locationData.image = `/uploads/${req.file.filename}`;
    }
    
    await Location.findByIdAndUpdate(req.params.id, locationData);
    res.redirect('/admin/locations');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Delete location
router.delete('/locations/:id', adminAuth, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    
    // Delete image file
    if (location.image) {
      const imagePath = path.join(__dirname, '../public', location.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Location.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Location deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Submissions management
router.get('/submissions', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const submissions = await Submission.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Submission.countDocuments();
    const pages = Math.ceil(total / limit);
    
    res.render('admin/submissions', {
      activeRoute: 'submissions',
      submissions,
      current: page,
      pages,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// View single submission
router.get('/submissions/:id', adminAuth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).send('Submission not found');
    }
    
    res.render('admin/submission-detail', { 
      activeRoute: 'submissions',
      submission 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Update submission status
router.post('/submissions/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['new', 'contacted', 'in-progress', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Add notes to submission
router.post('/submissions/:id/notes', adminAuth, async (req, res) => {
  try {
    const { notes } = req.body;
    
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { additionalInfo: notes },
      { new: true }
    );
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    res.json({ success: true, message: 'Notes updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Delete submission
router.delete('/submissions/:id', adminAuth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}); // Ensure this closing brace is present

// Generate report for a submission (HTML version instead of PDF)
router.get('/submissions/:id/report', adminAuth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    // Render a printable HTML page instead of generating a PDF
    res.render('admin/submission-report', {
      submission: submission,
      title: 'Submission Report',
      currentDate: new Date().toLocaleString()
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
}); // Ensure this closing brace is present

module.exports = router;
