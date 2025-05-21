const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureStaff } = require('../helpers/routeHelpers');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const Batch = require('../models/Batch');

// Set storage engine
const storage = multer.diskStorage({
  destination: './public/uploads/materials/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('materialFile');

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Only PDF, JPEG, JPG, PNG files are allowed!');
  }
}

// Material Index
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const materials = await Material.find({ batch: req.user.batch })
      .sort({ createdAt: 'desc' })
      .populate('batch')
      .lean();

    res.render('material/index', { materials });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Upload Material Page
router.get('/upload', ensureStaff, async (req, res) => {
  try {
    const batches = await Batch.find().lean();
    res.render('material/upload', { batches });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Upload Material
router.post('/upload', ensureStaff, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      req.flash('error_msg', err);
      return res.redirect('/material/upload');
    }

    if (!req.file) {
      req.flash('error_msg', 'No file selected');
      return res.redirect('/material/upload');
    }

    try {
      const fileSize = formatBytes(req.file.size);
      const newMaterial = new Material({
        title: req.body.title,
        filePath: `/uploads/materials/${req.file.filename}`,
        fileSize,
        batch: req.body.batch,
        uploadedBy: req.user.id
      });

      await newMaterial.save();
      req.flash('success_msg', 'Material uploaded successfully');
      res.redirect('/material');
    } catch (err) {
      console.error(err);
      fs.unlink(`./public/uploads/materials/${req.file.filename}`, () => {});
      res.render('error/500');
    }
  });
});

// Edit Material Page
router.get('/edit/:id', ensureStaff, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).lean();
    const batches = await Batch.find().lean();

    if (!material) {
      return res.render('error/404');
    }

    if (material.uploadedBy.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/material');
    }

    res.render('material/edit', { material, batches });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Update Material
router.put('/:id', ensureStaff, async (req, res) => {
  try {
    let material = await Material.findById(req.params.id);

    if (!material) {
      return res.render('error/404');
    }

    if (material.uploadedBy.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/material');
    }

    material = await Material.findByIdAndUpdate(
      { _id: req.params.id },
      {
        title: req.body.title,
        batch: req.body.batch,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    req.flash('success_msg', 'Material updated successfully');
    res.redirect('/material');
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Delete Material
router.delete('/:id', ensureStaff, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.render('error/404');
    }

    if (material.uploadedBy.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/material');
    }

    fs.unlink(`./public${material.filePath}`, async (err) => {
      if (err) console.error(err);
      await material.remove();
      req.flash('success_msg', 'Material removed');
      res.redirect('/material');
    });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = router;