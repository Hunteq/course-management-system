const Test = require('../models/Test');
const Question = require('../models/Question');
const Batch = require('../models/Batch');
const Result = require('../models/Result');

// List all tests
exports.listTests = async (req, res) => {
  try {
    const tests = await Test.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('batches')
      .populate('questions.question');

    res.render('tests/list', {
      title: 'Manage Tests',
      tests
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/staff/dashboard');
  }
};

// Show create test form
exports.showCreateForm = async (req, res) => {
  try {
    const batches = await Batch.find();

    res.render('tests/create', {
      title: 'Create New Test',
      batches
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/tests');
  }
};

// Create new test
exports.createTest = async (req, res) => {
    try {
      const { title, description, duration, totalMarks, passingMarks, startDate, endDate, batches } = req.body;
  
      if (!title || !duration || !totalMarks || !passingMarks || !startDate || !endDate || !batches) {
        req.flash('error_msg', 'Please fill in all required fields');
        return res.redirect('/tests/create');
      }
  
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();
  
      if (start >= end) {
        req.flash('error_msg', 'End date must be after start date');
        return res.redirect('/tests/create');
      }
  
      if (start < now) {
        req.flash('error_msg', 'Start date cannot be in the past');
        return res.redirect('/tests/create');
      }
  
      if (parseInt(passingMarks) > parseInt(totalMarks)) {
        req.flash('error_msg', 'Passing marks cannot be greater than total marks');
        return res.redirect('/tests/create');
      }
  
      const test = new Test({
        title,
        description,
        duration: parseInt(duration),
        totalMarks: parseInt(totalMarks),
        passingMarks: parseInt(passingMarks),
        startDate: start,
        endDate: end,
        batches,
        createdBy: req.user.id,
        isPublished: false
      });
  
      await test.save();
      req.flash('success_msg', 'Test created successfully. Now add questions.');
      res.redirect(`/tests/${test._id}/questions`);
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/tests/create');
    }
  };

// Show test questions management
exports.manageQuestions = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('questions.question')
      .populate('batches');

    if (!test || test.createdBy.toString() !== req.user.id.toString()) {
      req.flash('error_msg', 'Test not found');
      return res.redirect('/tests');
    }

    const questions = await Question.find({
      createdBy: req.user.id,
      _id: { $nin: test.questions.map(q => q.question._id) }
    }).sort({ createdAt: -1 });

    res.render('tests/manageQuestions', {
      title: 'Manage Test Questions',
      test,
      questions
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/tests');
  }
};

// Add question to test
exports.addQuestion = async (req, res) => {
  try {
    const {  questionId, marks } = req.body;
    const testId = req.params.id;

    const test = await Test.findById(testId);
    const question = await Question.findById(questionId);

    if (!test || test.createdBy.toString() !== req.user.id.toString()) {
      req.flash('error_msg', 'Test not found');
      return res.redirect('/tests');
    }

    if (!question || question.createdBy.toString() !== req.user.id.toString()) {
      req.flash('error_msg', 'Question not found');
      return res.redirect(`/tests/${testId}/questions`);
    }

    if (test.questions.some(q => q.question.toString() === questionId)) {
      req.flash('error_msg', 'Question already in this test');
      return res.redirect(`/tests/${testId}/questions`);
    }

    test.questions.push({
      question: questionId,
      marks: parseInt(marks)
    });

    await test.save();
    req.flash('success_msg', 'Question added to test successfully');
    res.redirect(`/tests/${testId}/questions`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect(`/tests/${req.params.id}/questions`);
  }
};

// Remove question from test
exports.removeQuestion = async (req, res) => {
    try {
      const { testId, questionId } = req.params;
      console.log(`Removing question ${questionId} from test ${testId}`); // Debug log
      
      const test = await Test.findById(testId);
      if (!test || test.createdBy.toString() !== req.user.id.toString()) {
        req.flash('error_msg', 'Test not found');
        return res.redirect('/tests');
      }
  
      test.questions = test.questions.filter(
        q => q.question.toString() !== questionId
      );
  
      await test.save();
      req.flash('success_msg', 'Question removed from test successfully');
      res.redirect(`/tests/${testId}/questions`);
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect(`/tests/${req.params.testId}/questions`);
    }
  };

// Preview test
exports.previewTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('questions.question')
      .populate('batches');

    if (!test || test.createdBy.toString() !== req.user.id.toString()) {
      req.flash('error_msg', 'Test not found');
      return res.redirect('/tests');
    }

    res.render('tests/preview', {
      title: 'Preview Test',
      test
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect(`/tests/${req.params.id}/questions`);
  }
};

// Publish test
exports.publishTest = async (req, res) => {
    try {
      const test = await Test.findById(req.params.id).populate('batches');
  
      if (!test || test.createdBy.toString() !== req.user.id.toString()) {
        req.flash('error_msg', 'Test not found');
        return res.redirect('/tests');
      }
  
      if (test.questions.length === 0) {
        req.flash('error_msg', 'Cannot publish test: Please add at least one question before publishing');
        return res.redirect(`/tests/${test._id}/questions`);
      }
  
      if (test.batches.length === 0) {
        req.flash('error_msg', 'Cannot publish test: Please assign to at least one batch');
        return res.redirect(`/tests/${test._id}/edit`);
      }
  
      test.isPublished = true;
      await test.save();
  
      req.flash('success_msg', 'Test published successfully to ' + 
        test.batches.length + ' batch(es)');
      res.redirect('/tests');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect(`/tests/${req.params.id}/questions`);
    }
  };

// Unpublish test
exports.unpublishTest = async (req, res) => {
    try {
      const test = await Test.findById(req.params.id);
  
      if (!test || test.createdBy.toString() !== req.user.id.toString()) {
        req.flash('error_msg', 'Test not found');
        return res.redirect('/tests');
      }
  
      test.isPublished = false;
      await test.save();
  
      req.flash('success_msg', 'Test unpublished successfully');
      res.redirect('/tests');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/tests');
    }
  };


// Delete test
exports.deleteTest = async (req, res) => {
    try {
      console.log('Attempting to delete test:', req.params.id);
      const test = await Test.findById(req.params.id);
      
      if (!test) {
        console.log('Test not found');
        req.flash('error_msg', 'Test not found');
        return res.redirect('/tests');
      }
  
      if (test.createdBy.toString() !== req.user.id.toString()) {
        console.log('Unauthorized deletion attempt');
        req.flash('error_msg', 'You can only delete tests you created');
        return res.redirect('/tests');
      }
  
     await Result.deleteMany({ test: test._id });
  
      await Test.findByIdAndDelete(req.params.id);
      console.log('Test deleted successfully');
      req.flash('success_msg', 'Test deleted successfully');
      res.redirect('/tests');
    } catch (err) {
      console.error('Error deleting test:', err);
      req.flash('error_msg', 'Server Error: ' + err.message);
      res.redirect('/tests');
    }
  };

// Edit test form
exports.showEditForm = async (req, res) => {
    try {
      const test = await Test.findById(req.params.id).populate('batches');
      const batches = await Batch.find();
  
      if (!test || test.createdBy.toString() !== req.user.id.toString()) {
        req.flash('error_msg', 'Test not found');
        return res.redirect('/tests');
      }
  
      res.render('tests/edit', {
        title: 'Edit Test',
        test,
        batches
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/tests');
    }
  };

// Update test
exports.updateTest = async (req, res) => {
    try {
      const { title, description, duration, totalMarks, passingMarks, startDate, endDate, batches } = req.body;
  
      const test = await Test.findById(req.params.id);
  
      if (!test || test.createdBy.toString() !== req.user.id.toString()) {
        req.flash('error_msg', 'Test not found');
        return res.redirect('/tests');
      }
  
      // Validation
      if (!title || !duration || !totalMarks || !passingMarks || !startDate || !endDate || !batches) {
        req.flash('error_msg', 'Please fill in all required fields');
        return res.redirect(`/tests/${test._id}/edit`);
      }
  
      if (new Date(startDate) >= new Date(endDate)) {
        req.flash('error_msg', 'End date must be after start date');
        return res.redirect(`/tests/${test._id}/edit`);
      }
  
      if (parseInt(passingMarks) > parseInt(totalMarks)) {
        req.flash('error_msg', 'Passing marks cannot be greater than total marks');
        return res.redirect(`/tests/${test._id}/edit`);
      }
  
      test.title = title;
      test.description = description;
      test.duration = parseInt(duration);
      test.totalMarks = parseInt(totalMarks);
      test.passingMarks = parseInt(passingMarks);
      test.startDate = startDate;
      test.endDate = endDate;
      test.batches = batches;
  
      await test.save();
      req.flash('success_msg', 'Test updated successfully');
      res.redirect('/tests');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect(`/tests/${req.params.id}/edit`);
    }
  };

// Student: Take test
exports.takeTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('questions.question')
      .populate('batches');

    if (!test || !test.isPublished) {
      req.flash('error_msg', 'Test not found');
      return res.redirect('/student/dashboard');
    }

    if (!test.batches.some(b => b._id.toString() === req.user.batch.toString())) {
      req.flash('error_msg', 'You are not assigned to this test');
      return res.redirect('/student/dashboard');
    }

    const currentDate = new Date();
    if (currentDate < test.startDate || currentDate > test.endDate) {
      req.flash('error_msg', 'Test is not available at this time');
      return res.redirect('/student/dashboard');
    }

    const existingResult = await Result.findOne({
      test: test._id,
      student: req.user.id
    });

    if (existingResult) {
      req.flash('error_msg', 'You have already taken this test');
      return res.redirect('/student/dashboard');
    }

    res.render('student/takeTest', {
      title: test.title,
      test
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/student/dashboard');
  }
};

// Student: Submit test
exports.submitTest = async (req, res) => {
    try {
      const test = await Test.findById(req.params.id)
        .populate('questions.question');
  
      if (!test || !test.isPublished) {
        req.flash('error_msg', 'Test not found');
        return res.redirect('/student/dashboard');
      }
  
      if (!test.batches.some(b => b._id.toString() === req.user.batch.toString())) {
        req.flash('error_msg', 'You are not assigned to this test');
        return res.redirect('/student/dashboard');
      }
  
      const currentDate = new Date();
      if (currentDate < test.startDate || currentDate > test.endDate) {
        req.flash('error_msg', 'Test is not available at this time');
        return res.redirect('/student/dashboard');
      }
  
      const existingResult = await Result.findOne({
        test: test._id,
        student: req.user.id
      });
  
      if (existingResult) {
        req.flash('error_msg', 'You have already taken this test');
        return res.redirect('/student/dashboard');
      }
  
      const answers = [];
      let totalMarksObtained = 0;
  
      for (const item of test.questions) {
        const question = item.question;
        const answerText = req.body[`answer_${question._id}`] || '';
        let isCorrect = false;
        let marksObtained = 0;
  
        if (question.questionType === 'mcq') {
          const correctOption = question.options.find(opt => opt.isCorrect);
          if (correctOption && answerText === correctOption.text) {
            isCorrect = true;
            marksObtained = item.marks;
            totalMarksObtained += marksObtained;
          }
        } else {
          if (question.correctAnswer && answerText.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
            isCorrect = true;
            marksObtained = item.marks;
            totalMarksObtained += marksObtained;
          } else {
            marksObtained = 0;
            isCorrect = false;
          }
        }
  
        answers.push({
          question: question._id,
          answer: answerText,
          isCorrect,
          marksObtained
        });
      }
  
      // Create result
      const result = new Result({
        test: test._id,
        student: req.user.id,
        answers,
        totalMarksObtained,
        isGraded: true 
      });
  
      await result.save();
      req.flash('success_msg', 'Test submitted successfully');
      res.redirect('/student/results');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect('/student/dashboard');
    }
  };

// Staff: View test results
exports.viewResults = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test || test.createdBy.toString() !== req.user.id.toString()) {
      req.flash('error_msg', 'Test not found');
      return res.redirect('/tests');
    }

    const results = await Result.find({ test: test._id })
      .populate('student')
      .sort({ totalMarksObtained: -1 });

    res.render('tests/results', {
      title: 'Test Results',
      test,
      results
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect(`/tests/${req.params.id}`);
  }
};

// Staff: Grade descriptive answers
exports.gradeResult = async (req, res) => {
    try {
      const result = await Result.findById(req.params.resultId)
        .populate('test')
        .populate({
          path: 'answers.question',
          model: 'Question'
        })
        .populate('gradedBy', 'name');
  
      if (!result || result.test.createdBy.toString() !== req.user.id.toString()) {
        req.flash('error_msg', 'Result not found');
        return res.redirect('/tests');
      }
  
      res.render('tests/grade', {
        title: 'Grade Test',
        result,
        test: result.test
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect(`/tests/${req.params.id}/results`);
    }
  };
  
  // Staff: Save grading
  exports.saveGrading = async (req, res) => {
    try {
      const result = await Result.findById(req.params.resultId)
        .populate('test');
  
      if (!result || result.test.createdBy.toString() !== req.user.id.toString()) {
        req.flash('error_msg', 'Result not found');
        return res.redirect('/tests');
      }
  
      let totalMarksObtained = 0;
      let allGraded = true;
  
      for (let i = 0; i < result.answers.length; i++) {
        const answer = result.answers[i];
        const marksKey = `marks_${answer.question}`;
        const feedbackKey = `feedback_${answer.question}`;
  
        if (req.body[marksKey]) {
          answer.marksObtained = parseInt(req.body[marksKey]);
          answer.feedback = req.body[feedbackKey] || '';
          
          const question = await Question.findById(answer.question);
          if (question && question.questionType !== 'mcq') {
            const maxMarks = result.test.questions.find(q => 
              q.question.toString() === answer.question.toString()
            ).marks;
            
            answer.isCorrect = answer.marksObtained >= (maxMarks * 0.5); 
          }
        } else {
          allGraded = false;
        }
  
        totalMarksObtained += answer.marksObtained;
      }
  
      result.totalMarksObtained = totalMarksObtained;
      result.isGraded = allGraded;
      result.gradedBy = req.user.id;
  
      await result.save();
      req.flash('success_msg', 'Grading saved successfully');
      res.redirect(`/tests/${result.test._id}/results`);
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Server Error');
      res.redirect(`/tests/${req.params.id}/results`);
    }
  };

