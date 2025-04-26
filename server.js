// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const fs = require('fs');
const cors = require('cors');

// Import models
const Newsletter = require('./models/Newsletter');
const NewsletterLog = require('./models/NewsletterLog');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');  // or whatever view engine you're using

// Debug logging
console.log('Current directory:', __dirname);
console.log('Views directory:', path.join(__dirname, 'views'));
console.log('Admin login view path:', path.join(__dirname, 'views', 'admin', 'login.ejs'));
console.log('Admin header partial path:', path.join(__dirname, 'views', 'partials', 'header.ejs'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tundua_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));
app.use(flash());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, 'public')));

// Add this line to log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Global variables for flash messages and template defaults
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg') || '';
  res.locals.error_msg = req.flash('error_msg') || '';
  res.locals.error = req.flash('error') || '';
  res.locals.errors = [];
  res.locals.user = req.session.user || null;
  res.locals.activeRoute = '';
  next();
});

// Make models available globally
app.locals.Newsletter = Newsletter;
app.locals.NewsletterLog = NewsletterLog;

// Create necessary directories if they don't exist
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Create required directories
createDirIfNotExists(path.join(__dirname, 'public'));
createDirIfNotExists(path.join(__dirname, 'public', 'uploads'));
createDirIfNotExists(path.join(__dirname, 'public', 'img'));
createDirIfNotExists(path.join(__dirname, 'views'));
createDirIfNotExists(path.join(__dirname, 'views', 'partials'));
createDirIfNotExists(path.join(__dirname, 'views', 'admin'));

// Ensure we have a placeholder logo if it doesn't exist
const logoPath = path.join(__dirname, 'public', 'img', 'tundua.png');
if (!fs.existsSync(logoPath)) {
  console.log(`Warning: Logo file doesn't exist at ${logoPath}`);
  console.log('You should add a logo image at this location');
}

// Import routes
const adminRoutes = require('./routes/admin-routes');
const apiRoutes = require('./routes/api');

// Simple test route to verify server is working
app.get('/test', (req, res) => {
  res.send('Server is running correctly!');
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const testSubscriber = new Newsletter({ email: 'test@example.com' });
    await testSubscriber.save();
    await Newsletter.deleteOne({ email: 'test@example.com' });
    res.send('Database connection is working');
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).send('Database connection error');
  }
});

// Use routes
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// Serve favicon.ico to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(__dirname, 'public', 'img', 'favicon.ico');
  if (fs.existsSync(faviconPath)) {
    res.sendFile(faviconPath);
  } else {
    res.status(204).end(); // No content response if favicon doesn't exist
  }
});

// Debug logging for the root directory
console.log('----- ROOT PATH DEBUG -----');
console.log('Current directory:', __dirname);
console.log('Parent directory:', path.resolve(__dirname, '..'));
console.log('Frontend index should be at:', path.join(path.resolve(__dirname, '..'), 'public', 'index.html'));

// Check if frontend index exists
const frontendIndexPath = path.join(path.resolve(__dirname, '..'), 'public', 'index.html');
const backendIndexPath = path.join(__dirname, 'public', 'index.html');

console.log('Frontend index.html exists?', fs.existsSync(frontendIndexPath));
console.log('Backend index.html exists?', fs.existsSync(backendIndexPath));

// Static files middleware
app.use(express.static(path.join(__dirname, 'public')));

// Simple route handler for pages without extensions
app.get('/:page', (req, res) => {
  const filePath = path.join(__dirname, 'public', `${req.params.page}.html`);
  console.log('Requested page:', req.params.page);
  console.log('Looking for file at:', filePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('File not found:', filePath);
      res.status(404).send('Page not found');
    }
  });
});

// Root route handler
app.get('/', (req, res) => {
  console.log('Root route handler called');
  if (fs.existsSync(backendIndexPath)) {
    console.log('Serving backend index.html');
    return res.sendFile(backendIndexPath);
  } else if (fs.existsSync(frontendIndexPath)) {
    console.log('Serving frontend index.html');
    return res.sendFile(frontendIndexPath);
  } else {
    console.log('No index.html found in either location');
    return res.send('Hello! Index.html not found. Check server logs.');
  }
});

// 404 handler for all other routes
app.use((req, res) => {
  console.log('404 for route:', req.path);
  res.status(404).send(`Route not found: ${req.path}`);
});

// Recursive directory copy function
function copyDirRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
    console.log(`Created directory: ${target}`);
  }
  const entries = fs.readdirSync(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied file: ${sourcePath} to ${targetPath}`);
    }
  }
}

// Synchronize frontend files to backend public folder
function syncFrontendFiles() {
  console.log('Synchronizing frontend files to backend...');
  const frontendPublicPath = path.join(__dirname, '..', 'public');
  const backendPublicPath = path.join(__dirname, 'public');
  if (!fs.existsSync(frontendPublicPath)) {
    console.error('Frontend public folder not found at:', frontendPublicPath);
    return;
  }
  if (!fs.existsSync(backendPublicPath)) {
    fs.mkdirSync(backendPublicPath, { recursive: true });
  }
  try {
    const entries = fs.readdirSync(frontendPublicPath, { withFileTypes: true });
    for (const entry of entries) {
      const sourcePath = path.join(frontendPublicPath, entry.name);
      const targetPath = path.join(backendPublicPath, entry.name);
      if (entry.isDirectory()) {
        copyDirRecursive(sourcePath, targetPath);
      } else if (entry.name.endsWith('.html') || 
                entry.name.endsWith('.css') || 
                entry.name.endsWith('.js') ||
                entry.name.endsWith('.png') ||
                entry.name.endsWith('.jpg') ||
                entry.name.endsWith('.jpeg') ||
                entry.name.endsWith('.gif') ||
                entry.name.endsWith('.svg') ||
                entry.name.endsWith('.ico')) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied file: ${entry.name} to backend public folder`);
      }
    }
    console.log('Frontend files synchronized successfully');
  } catch (err) {
    console.error('Error in syncFrontendFiles:', err);
  }
}

// Run the synchronization before starting the server
syncFrontendFiles();

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Visit http://localhost:${port}/test to verify server is running`);
  console.log(`Visit http://localhost:${port}/ to view the website`);
  console.log(`Admin panel available at http://localhost:${port}/admin/login`);
});