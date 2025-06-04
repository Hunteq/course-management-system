const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { ensureAuthenticated, ensureStaff } = require('../middleware/auth');

// List all tests
router.get('/', ensureAuthenticated, ensureStaff, testController.listTests);

// Create test
router.get('/create', ensureAuthenticated, ensureStaff, testController.showCreateForm);
router.post('/', ensureAuthenticated, ensureStaff, testController.createTest);

// Manage test questions
router.get('/:id/questions', ensureAuthenticated, ensureStaff, testController.manageQuestions);
router.post('/:id/questions/add', ensureAuthenticated, ensureStaff, testController.addQuestion);

router.post('/:testId/questions/:questionId/remove', ensureAuthenticated, ensureStaff, testController.removeQuestion);
// Preview test
router.get('/:id/preview', ensureAuthenticated, ensureStaff, testController.previewTest);

// Publish test
router.post('/:id/publish', ensureAuthenticated, ensureStaff, testController.publishTest);
router.post('/:id/unpublish', ensureAuthenticated, ensureStaff, testController.unpublishTest);

// Edit test
router.get('/:id/edit', ensureAuthenticated, ensureStaff, testController.showEditForm);
router.put('/:id', ensureAuthenticated, ensureStaff, testController.updateTest);

// Delete test
router.delete('/:id', ensureAuthenticated, ensureStaff, testController.deleteTest);

// Test results
router.get('/:id/results', ensureAuthenticated, ensureStaff, testController.viewResults);
router.get('/:id/results/:resultId/grade', ensureAuthenticated, ensureStaff, testController.gradeResult);
router.post('/:id/results/:resultId/grade', ensureAuthenticated, ensureStaff, testController.saveGrading);

// Student test taking
router.get('/:id/take', ensureAuthenticated, testController.takeTest);
router.post('/:id/submit', ensureAuthenticated,testController.submitTest);

module.exports = router;

