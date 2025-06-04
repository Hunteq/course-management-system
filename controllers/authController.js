const User = require('../models/User');
const Batch = require('../models/Batch');
const bcrypt = require('bcryptjs');
const passport = require('passport'); 


// Register a new user (admin only)
exports.register = async (req, res, next) => {
    const { name, email, password, password2, role, batch } = req.body;
  
    try {
      if (!name || !email || !password || !password2 || !role) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect('/admin/manage-users');
      }
  
      if (password !== password2) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect('/admin/manage-users');
      }
  
      if (password.length < 6) {
        req.flash('error_msg', 'Password should be at least 6 characters');
        return res.redirect('/admin/manage-users');
      }
  
      const userExists = await User.findOne({ email });
      if (userExists) {
        req.flash('error_msg', 'Email already registered');
        return res.redirect('/admin/manage-users');
      }
  
      const user = new User({
        name,
        email,
        password,
        role
      });
  
      if (role === 'student' && batch) {
        user.batch = batch;
        await Batch.findByIdAndUpdate(batch, { 
          $push: { students: user._id } 
        }, { new: true });
      }
  
      await user.save();
  
      req.flash('success_msg', 'User registered successfully');
      res.redirect('/admin/manage-users');
    } catch (err) {
      console.error('Registration error:', err);
      req.flash('error_msg', 'Server error during registration');
      res.redirect('/admin/manage-users');
    }
  };
// Login user
exports.login = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
};

// Logout user
exports.logout = (req, res) => {
    req.logout(function(err) {
      if (err) { 
        console.error(err);
        req.flash('error_msg', 'Error during logout');
        return res.redirect('/');
      }
      req.flash('success_msg', 'You are logged out');
      res.redirect('/login');
    });
  };

// Dashboard redirect based on role
exports.dashboard = async (req, res) => {
    try {
      console.log('Dashboard access attempt by user:', req.user); 
      
      if (!req.user) {
        console.log('No user found, redirecting to login');
        return res.redirect('/login');
      }
  
      console.log(`User role: ${req.user.role}`); 
      
      switch (req.user.role) {
        case 'admin':
          console.log('Redirecting to admin dashboard');
          return res.redirect('/admin/dashboard');
        case 'staff':
          console.log('Redirecting to staff dashboard');
          return res.redirect('/staff/dashboard');
        case 'student':
          console.log('Redirecting to student dashboard');
          return res.redirect('/student/dashboard');
        default:
          console.log('Unknown role, redirecting to login');
          return res.redirect('/login');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      res.redirect('/login');
    }
  };