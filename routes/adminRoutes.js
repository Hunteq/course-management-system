const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Admin Dashboard
router.get('/dashboard', ensureAuthenticated, ensureAdmin, adminController.dashboard);

// Manage Users
router.get('/manage-users', ensureAuthenticated, ensureAdmin, adminController.manageUsers);
router.post('/manage-users', ensureAuthenticated, ensureAdmin, authController.register);
router.delete('/users/:id', ensureAuthenticated, ensureAdmin, adminController.deleteUser);

// Manage Batches
router.get('/batches', ensureAuthenticated, ensureAdmin, adminController.manageBatches);
router.post('/batches', ensureAuthenticated, ensureAdmin, adminController.createBatch);
router.get('/batches/:id', ensureAuthenticated, ensureAdmin, adminController.viewBatch);

router.post('/batches/:id/add-student', ensureAuthenticated, ensureAdmin, adminController.addStudentToBatch);

router.delete('/batches/:batchId/students/:studentId', ensureAuthenticated, ensureAdmin, adminController.removeStudentFromBatch);

router.delete('/batches/:id', ensureAuthenticated, ensureAdmin, adminController.deleteBatch);

// Edit Users
router.get('/users/:id/edit', ensureAuthenticated, ensureAdmin, adminController.showEditUserForm);
router.put('/users/:id', ensureAuthenticated, ensureAdmin, adminController.updateUser);


module.exports = router;