const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureStaff } = require('../helpers/routeHelpers');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Batch = require('../models/Batch');

// Test Index
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const tests = await Test.find({ batches: req.user.batch })
      .sort({ createdAt: 'desc' })
      .populate('batches')
      .lean();

    res.render('test/index', { tests });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Create Test Page
router.get('/create', ensureStaff, async (req, res) => {
  try {
    const batches = await Batch.find().lean();
    res.render('test/create', { batches });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Create Test
router.post('/', ensureStaff, async (req, res) => {
  try {
    const { title, description, startDate, endDate, timer } = req.body;
    
    const newTest = new Test({
      title,
      description,
      startDate,
      endDate,
      timer,
      createdBy: req.user.id
    });

    await newTest.save();
    req.flash('success_msg', 'Test created successfully');
    res.redirect(`/test/${newTest._id}/assign`);
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Assign Test to Batches Page
router.get('/:id/assign', ensureStaff, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).lean();
    const batches = await Batch.find().lean();

    if (!test) {
      return res.render('error/404');
    }

    if (test.createdBy.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/test');
    }

    res.render('test/assign', { test, batches });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Assign Test to Batches
router.put('/:id/assign', ensureStaff, async (req, res) => {
  try {
    let test = await Test.findById(req.params.id);

    if (!test) {
      return res.render('error/404');
    }

    if (test.createdBy.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/test');
    }

    test = await Test.findByIdAndUpdate(
      { _id: req.params.id },
      { $addToSet: { batches: { $each: req.body.batches } } },
      { new: true, runValidators: true }
    );

    req.flash('success_msg', 'Test assigned successfully');
    res.redirect(`/test/${test._id}/questions`);
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Create Question Page
router.get('/:id/questions', ensureStaff, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('questions')
      .lean();

    if (!test) {
      return res.render('error/404');
    }

    if (test.createdBy.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/test');
    }

    res.render('test/createQuestion', { test });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Create Question
router.post('/:id/questions', ensureStaff, async (req, res) => {
  try {
    const { text, options, explanation } = req.body;
    
    // Process options
    const processedOptions = options.map(option => ({
      text: option.text,
      isCorrect: option.isCorrect === 'true'
    }));

    const newQuestion = new Question({
      text,
      options: processedOptions,
      explanation,
      createdBy: req.user.id
    });

    await newQuestion.save();

    // Add question to test
    await Test.findByIdAndUpdate(
      req.params.id,
      { $push: { questions: newQuestion._id } },
      { new: true }
    );

    req.flash('success_msg', 'Question added successfully');
    res.redirect(`/test/${req.params.id}/questions`);
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

module.exports = router;