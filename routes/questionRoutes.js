const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { ensureAuthenticated, ensureStaff } = require('../middleware/auth');

// List all questions
router.get('/', ensureAuthenticated, ensureStaff, questionController.listQuestions);

// Create question
router.get('/create', ensureAuthenticated, ensureStaff, questionController.showCreateForm);
router.post('/', ensureAuthenticated, ensureStaff, questionController.createQuestion);

// Edit question
router.get('/:id/edit', ensureAuthenticated, ensureStaff, questionController.showEditForm);
router.put('/:id', ensureAuthenticated, ensureStaff, questionController.updateQuestion);

// Preview question
router.get('/:id/preview', ensureAuthenticated, ensureStaff, questionController.previewQuestion);

// Delete question
router.delete('/:id', ensureAuthenticated, ensureStaff, questionController.deleteQuestion);

module.exports = router;