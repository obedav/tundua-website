// routes/auth-routes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Setup Passport Local Strategy
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      
      // No user found
      if (!user) {
        return done(null, false, { message: 'Email not registered' });
      }
      
      // Compare password
      const isMatch = await user.comparePassword(password);
      
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (err) {
      console.error(err);
      return done(err);
    }
  })
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Login Page
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', {
    title: 'Admin Login'
  });
});

// Login Handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin/login',
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/admin/login');
});

// Register Admin User (only accessible to existing admins)
router.get('/register', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.render('admin/register', {
    title: 'Register New Admin',
    user: req.user
  });
});

// Register Handle
router.post('/register', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const { name, email, password, password2, role } = req.body;
    let errors = [];
    
    // Check required fields
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please fill in all fields' });
    }
    
    // Check passwords match
    if (password !== password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
    
    // Check password length
    if (password.length < 6) {
      errors.push({ msg: 'Password should be at least 6 characters' });
    }
    
    if (errors.length > 0) {
      return res.render('admin/register', {
        errors,
        name,
        email,
        role,
        title: 'Register New Admin',
        user: req.user
      });
    }
    
    // Validation passed
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      errors.push({ msg: 'Email is already registered' });
      return res.render('admin/register', {
        errors,
        name,
        email,
        role,
        title: 'Register New Admin',
        user: req.user
      });
    }
    
    // Create new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'staff'
    });
    
    await newUser.save();
    req.flash('success_msg', 'User registered successfully');
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'An error occurred during registration');
    res.redirect('/admin/register');
  }
});

// User Management (only for admins)
router.get('/users', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.render('admin/users', {
      users,
      title: 'User Management',
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Could not retrieve users');
    res.redirect('/admin/dashboard');
  }
});

// Delete User (only for admins)
router.delete('/users/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;