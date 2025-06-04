const Test = require('../models/Test');
const Result = require('../models/Result');
const Batch = require('../models/Batch');
const Material = require('../models/Material');

// Student Dashboard
exports.dashboard = async (req, res) => {
    try {
      if (!req.user.batch) {
        return res.render('student/dashboard', {
          title: 'Student Dashboard',
          activeTests: [],
          upcomingTests: [],  
          completedTests: [],
          error: 'You are not assigned to any batch'
        });
      }
  
      const currentDate = new Date();
      
      const [activeTests, upcomingTests, completedTests] = await Promise.all([
        Test.find({
          batches: req.user.batch,
          startDate: { $lte: currentDate },
          endDate: { $gte: currentDate },
          isPublished: true
        }).sort({ startDate: 1 }),
        Test.find({
          batches: req.user.batch,
          startDate: { $gt: currentDate },
          isPublished: true
        }).sort({ startDate: 1 }),
        Test.find({
          batches: req.user.batch,
          endDate: { $lt: currentDate },
          isPublished: true
        }).sort({ endDate: -1 })
      ]);
  
      res.render('student/dashboard', {
        title: 'Student Dashboard',
        activeTests,
        upcomingTests,
        completedTests
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/');
    }
  };

// View Course Materials
exports.viewMaterials = async (req, res) => {
    try {
      if (!req.user.batch) {
        return res.render('student/materials', {
          title: 'Course Materials',
          materials: [],
          error: 'You are not assigned to any batch'
        });
      }
  
      const materials = await Material.find({
        $or: [
          { batches: req.user.batch },
          { batches: { $size: 0 } } 
        ]
      })
      .sort({ createdAt: -1 })
      .populate('batches')
      .populate('uploadedBy', 'name');
  
      res.render('student/materials', {
        title: 'Course Materials',
        materials
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/student/dashboard');
    }
  };

// View Test Results
exports.viewResults = async (req, res) => {
    try {
      const results = await Result.find({ student: req.user.id })
        .populate('test')
        .populate('gradedBy', 'name')
        .sort({ submittedAt: -1 });
  
      const passedResults = results.filter(result => 
        result.isGraded && result.totalMarksObtained >= result.test.passingMarks
      );
      
      const failedResults = results.filter(result => 
        result.isGraded && result.totalMarksObtained < result.test.passingMarks
      );
  
      res.render('student/testResults', {
        title: 'Test Results',
        passedResults,
        failedResults,
        allResults: results 
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/student/dashboard');
    }
  };
  
  // View Single Result
  exports.viewResult = async (req, res) => {
    try {
      const result = await Result.findById(req.params.id)
        .populate('test')
        .populate({
          path: 'answers.question',
          model: 'Question'
        });
  
      if (!result || result.student.toString() !== req.user.id.toString()) {
        req.flash('error_msg', 'Result not found');
        return res.redirect('/student/results');
      }
  
      res.render('student/viewResult', {
        title: 'Test Result',
        result
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/student/results');
    }
  };

