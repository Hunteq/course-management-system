require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const ejsLayouts = require('express-ejs-layouts');
const path = require('path');

// Initialize app
const app = express();

// Database connection
const connectDB = require('./config/db');
connectDB(); 

// Passport config
require('./config/passport')(passport);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// EJS setup
app.use(ejsLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout');

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/', require('./routes/authRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/staff', require('./routes/staffRoutes'));
app.use('/student', require('./routes/studentRoutes'));
app.use('/tests', require('./routes/testRoutes'));
app.use('/questions', require('./routes/questionRoutes'));

// 404 Page
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});