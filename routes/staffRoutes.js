const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { ensureAuthenticated, ensureStaff } = require('../middleware/auth');

// Staff Dashboard
router.get('/dashboard', ensureAuthenticated, ensureStaff, staffController.dashboard);

// Course Materials
router.get('/materials', ensureAuthenticated, ensureStaff, staffController.viewMaterials);
router.get('/upload-material', ensureAuthenticated, ensureStaff, staffController.uploadMaterial);
router.post('/upload-material', ensureAuthenticated, ensureStaff, staffController.saveMaterial);
router.delete('/materials/:id', ensureAuthenticated, ensureStaff, staffController.deleteMaterial);

// Edit material
router.get('/materials/:id/edit', ensureAuthenticated, ensureStaff, staffController.showEditMaterialForm);
router.put('/materials/:id', ensureAuthenticated, ensureStaff, staffController.updateMaterial);

module.exports = router;