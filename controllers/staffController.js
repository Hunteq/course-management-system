const Test = require('../models/Test');
const Batch = require('../models/Batch');
const Question = require('../models/Question');
const Material = require('../models/Material');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Staff Dashboard
exports.dashboard = async (req, res) => {
  try {
    const tests = await Test.countDocuments({ createdBy: req.user.id });
    const questions = await Question.countDocuments({ createdBy: req.user.id });
    const publishedTests = await Test.countDocuments({ 
      createdBy: req.user.id, 
      isPublished: true 
    });

    res.render('staff/dashboard', {
      title: 'Staff Dashboard',
      tests,
      questions,
      publishedTests
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/');
  }
};

// multer for file uploads
const materialStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../public/uploads/materials');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
  
  const uploadMaterial = multer({ 
    storage: materialStorage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
    fileFilter: (req, file, cb) => {
      const filetypes = /pdf|ppt|pptx|doc|docx|xls|xlsx|zip/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error('Only document files are allowed (PDF, PPT, DOC, XLS, ZIP)'));
    }
  });

// Upload Course Material 
exports.uploadMaterial = async (req, res) => {
    try {
      const batches = await Batch.find();
      res.render('staff/uploadMaterial', {
        title: 'Upload Course Material',
        batches
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/staff/materials');
    }
  };

// View Course Materials
exports.viewMaterials = async (req, res) => {
    try {
      const materials = await Material.find({ uploadedBy: req.user.id })
        .sort({ createdAt: -1 })
        .populate('batches')
        .populate('uploadedBy', 'name');
  
      const batches = await Batch.find();
  
      res.render('staff/materials', {
        title: 'Course Materials',
        materials,
        batches
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/staff/dashboard');
    }
  };

// Save Course Material
exports.saveMaterial = async (req, res) => {
    try {
      uploadMaterial.single('materialFile')(req, res, async (err) => {
        if (err) {
          req.flash('error_msg', err.message);
          return res.redirect('/staff/upload-material');
        }
  
        const { title, description, batches } = req.body;
        const file = req.file;
  
        if (!file) {
          req.flash('error_msg', 'Please select a file to upload');
          return res.redirect('/staff/upload-material');
        }

        let batchArray = [];
        if (batches) {
            batchArray = Array.isArray(batches) ? batches : [batches];
        }
  
        const material = new Material({
          title,
          description,
          filePath: `/uploads/materials/${file.filename}`,
          fileType: path.extname(file.originalname).substring(1),
          fileSize: file.size,
          uploadedBy: req.user.id,
          batches: Array.isArray(batches) ? batches : [batches]
        });
  
        await material.save();
  
        req.flash('success_msg', 'Material uploaded successfully');
        res.redirect('/staff/materials');
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Error uploading material');
      res.redirect('/staff/upload-material');
    }
  };

  
// Show edit material form
exports.showEditMaterialForm = async (req, res) => {
    try {
      const material = await Material.findOne({
        _id: req.params.id,
        uploadedBy: req.user.id
      });
      
      if (!material) {
        req.flash('error_msg', 'Material not found');
        return res.redirect('/staff/materials');
      }
  
      const batches = await Batch.find();
  
      res.render('staff/editMaterial', {
        title: 'Edit Material',
        material,
        batches
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/staff/materials');
    }
  };
  
// Update material
exports.updateMaterial = async (req, res) => {
    try {
      uploadMaterial.single('materialFile')(req, res, async (err) => {
        if (err) {
          req.flash('error_msg', err.message);
          return res.redirect(`/staff/materials/${req.params.id}/edit`);
        }
  
        const { title, description, batches } = req.body;
        const file = req.file;
        const material = await Material.findOne({
          _id: req.params.id,
          uploadedBy: req.user.id
        });
  
        if (!material) {
          req.flash('error_msg', 'Material not found');
          return res.redirect('/staff/materials');
        }
  
        material.title = title;
        material.description = description;
        material.batches = Array.isArray(batches) ? batches : [batches];
  
        if (file) {
          const oldFilePath = path.join(__dirname, '../public', material.filePath);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
  
          material.filePath = `/uploads/materials/${file.filename}`;
          material.fileType = path.extname(file.originalname).substring(1);
          material.fileSize = file.size;
        }
  
        await material.save();
        
        req.flash('success_msg', 'Material updated successfully');
        res.redirect('/staff/materials');
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Error updating material');
      res.redirect(`/staff/materials/${req.params.id}/edit`);
    }
  };

  // Delete Material
exports.deleteMaterial = async (req, res) => {
    try {
      const material = await Material.findOne({
        _id: req.params.id,
        uploadedBy: req.user.id
      });

      if (!material) {
        req.flash('error_msg', 'Material not found');
        return res.redirect('/staff/materials');
      }

      const filePath = path.join(__dirname, '../public', material.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await material.deleteOne();
      
      req.flash('success_msg', 'Material deleted successfully');
      res.redirect('/staff/materials');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/staff/materials');
    }
  };