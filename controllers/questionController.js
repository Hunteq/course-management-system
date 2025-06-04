const Question = require('../models/Question');
const multer = require('multer');
const path = require('path');

// multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
}).single('image');

// List all questions
exports.listQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });

    res.render('questions/list', {
      title: 'Question Bank',
      questions
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/staff/dashboard');
  }
};

// Show create question form
exports.showCreateForm = (req, res) => {
  res.render('questions/create', {
    title: 'Create New Question'
  });
};

// Create new question
exports.createQuestion = (req, res) => {
  upload(req, res, async (err) => {
    try {
      const { questionType, questionText, marks, options, correctAnswer } = req.body;

      if (!questionType || !questionText || !marks) {
        req.flash('error_msg', 'Please fill in all required fields');
        return res.redirect('/questions/create');
      }

      if (questionType === 'mcq' && (!options || options.length < 2)) {
        req.flash('error_msg', 'MCQ questions must have at least 2 options');
        return res.redirect('/questions/create');
      }

      if (questionType !== 'mcq' && !correctAnswer) {
        req.flash('error_msg', 'Please provide a correct answer');
        return res.redirect('/questions/create');
      }

      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          req.flash('error_msg', 'Image size exceeds 5MB limit');
        } else {
          req.flash('error_msg', err.message);
        }
        return res.redirect('/questions/create');
      }

      let questionImage = '';
      if (req.file) {
        questionImage = `/uploads/${req.file.filename}`;
      }

      let processedOptions = [];
      if (questionType === 'mcq' && options) {
        processedOptions = options.map((opt, index) => {
          const isCorrect = req.body[`isCorrect_${index}`] === 'on';
          return {
            text: opt,
            isCorrect
          };
        });

        if (!processedOptions.some(opt => opt.isCorrect)) {
          req.flash('error_msg', 'At least one option must be correct');
          return res.redirect('/questions/create');
        }
      }

      const question = new Question({
        questionType,
        questionText,
        questionImage,
        marks: parseInt(marks),
        options: processedOptions,
        correctAnswer: questionType !== 'mcq' ? correctAnswer : '',
        createdBy: req.user.id
      });

      await question.save();
      req.flash('success_msg', 'Question created successfully');
      res.redirect('/questions');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/questions/create');
    }
  });
};

// Show edit question form
exports.showEditForm = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question || question.createdBy.toString() !== req.user.id.toString()) {
      req.flash('error_msg', 'Question not found');
      return res.redirect('/questions');
    }

    res.render('questions/edit', {
      title: 'Edit Question',
      question
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/questions');
  }
};

// Update question
exports.updateQuestion = (req, res) => {
  upload(req, res, async (err) => {
    try {
      const { questionType, questionText, marks, options, correctAnswer } = req.body;
      const question = await Question.findById(req.params.id);

      if (!question || question.createdBy.toString() !== req.user.id.toString()) {
        req.flash('error_msg', 'Question not found');
        return res.redirect('/questions');
      }

      if (!questionType || !questionText || !marks) {
        req.flash('error_msg', 'Please fill in all required fields');
        return res.redirect(`/questions/${question._id}/edit`);
      }

      if (questionType === 'mcq' && (!options || options.length < 2)) {
        req.flash('error_msg', 'MCQ questions must have at least 2 options');
        return res.redirect(`/questions/${question._id}/edit`);
      }

      if (questionType !== 'mcq' && !correctAnswer) {
        req.flash('error_msg', 'Please provide a correct answer');
        return res.redirect(`/questions/${question._id}/edit`);
      }

      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          req.flash('error_msg', 'Image size exceeds 5MB limit');
        } else {
          req.flash('error_msg', err.message);
        }
        return res.redirect(`/questions/${question._id}/edit`);
      }

      if (req.file) {
        question.questionImage = `/uploads/${req.file.filename}`;
      }

      let processedOptions = [];
      if (questionType === 'mcq' && options) {
        processedOptions = options.map((opt, index) => {
          const isCorrect = req.body[`isCorrect_${index}`] === 'on';
          return {
            text: opt,
            isCorrect
          };
        });

        if (!processedOptions.some(opt => opt.isCorrect)) {
          req.flash('error_msg', 'At least one option must be correct');
          return res.redirect(`/questions/${question._id}/edit`);
        }
      }

      question.questionType = questionType;
      question.questionText = questionText;
      question.marks = parseInt(marks);
      question.options = processedOptions;
      question.correctAnswer = questionType !== 'mcq' ? correctAnswer : '';

      await question.save();
      req.flash('success_msg', 'Question updated successfully');
      res.redirect('/questions');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect(`/questions/${req.params.id}/edit`);
    }
  });
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question || question.createdBy.toString() !== req.user.id.toString()) {
      req.flash('error_msg', 'Question not found');
      return res.redirect('/questions');
    }

    await Question.deleteOne({ _id: req.params.id });

    req.flash('success_msg', 'Question deleted successfully');
    res.redirect('/questions');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/questions');
  }
};

// Preview question
exports.previewQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question || question.createdBy.toString() !== req.user.id.toString()) {
      req.flash('error_msg', 'Question not found');
      return res.redirect('/questions');
    }

    res.render('questions/preview', {
      title: 'Preview Question',
      question
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/questions');
  }
};