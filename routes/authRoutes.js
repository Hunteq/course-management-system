const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('auth/login', { title: 'Login' }));

// Register Page (Admin only)
router.get('/register', forwardAuthenticated, (req, res) => res.render('auth/register', { title: 'Register' }));

// Login Handle
router.post('/login', authController.login);

// Register Handle
router.post('/register', authController.register);

// Logout Handle
router.get('/logout', authController.logout);

// Dashboard
router.get('/dashboard', ensureAuthenticated, authController.dashboard);

module.exports = router;