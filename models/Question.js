const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionType: {
    type: String,
    enum: ['mcq', 'short', 'long', 'image'],
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionImage: {
    type: String
  },
  marks: {
    type: Number,
    required: true,
    enum: [1, 2, 5]
  },
  options: [{
    text: String,
    image: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', QuestionSchema);