const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../helpers/routeHelpers');
const Material = require('../models/Material');
const Test = require('../models/Test');
const passport = require('passport');
const User = require('../models/User');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('index'));

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('auth/login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('auth/register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2, role, rollNo } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2 || !role) {
    errors.push({ msg: 'Please fill in all required fields' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }

  if (role === 'student' && !rollNo) {
    errors.push({ msg: 'Roll number is required for students' });
  }

  if (errors.length > 0) {
    res.render('auth/register', {
      errors,
      name,
      email,
      password,
      password2,
      role,
      rollNo
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email is already registered' });
        res.render('auth/register', {
          errors,
          name,
          email,
          password,
          password2,
          role,
          rollNo
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          role,
          rollNo: role === 'student' ? rollNo : undefined
        });

        newUser.save()
          .then(user => {
            req.flash('success_msg', 'You are now registered and can log in');
            res.redirect('/login');
          })
          .catch(err => console.log(err));
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const materials = await Material.find({ batch: req.user.batch })
      .sort({ createdAt: 'desc' })
      .populate('batch')
      .lean();
    
    const tests = await Test.find({ batches: req.user.batch })
      .sort({ createdAt: 'desc' })
      .populate('batches')
      .lean();

    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user,
      materials,
      tests
    });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

module.exports = router;