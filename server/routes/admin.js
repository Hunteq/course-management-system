const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../helpers/routeHelpers');
const User = require('../models/User');
const Batch = require('../models/Batch');

// Admin Dashboard
router.get('/', ensureAdmin, async (req, res) => {
  try {
    const users = await User.find().lean();
    const batches = await Batch.find().lean();
    res.render('admin/index', { users, batches });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Manage Users
router.get('/users', ensureAdmin, async (req, res) => {
  try {
    const users = await User.find().populate('batch').lean();
    const batches = await Batch.find().lean();
    res.render('admin/users', { users, batches });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Create Batch
router.post('/batches', ensureAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const newBatch = new Batch({
      name,
      description
    });

    await newBatch.save();
    req.flash('success_msg', 'Batch created successfully');
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Assign User to Batch
router.put('/users/:id/assign', ensureAdmin, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.params.id,
      { batch: req.body.batch },
      { new: true, runValidators: true }
    );

    req.flash('success_msg', 'User assigned to batch successfully');
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

module.exports = router;