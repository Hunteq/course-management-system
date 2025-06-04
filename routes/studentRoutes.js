const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { ensureAuthenticated, ensureStudent } = require('../middleware/auth');

// Student Dashboard
router.get('/dashboard', ensureAuthenticated, ensureStudent, studentController.dashboard);

// Course Materials
router.get('/materials', ensureAuthenticated, ensureStudent, studentController.viewMaterials);

// Test Results
router.get('/results', ensureAuthenticated, ensureStudent, studentController.viewResults);
router.get('/results/:id', ensureAuthenticated, ensureStudent, studentController.viewResult);

module.exports = router;

