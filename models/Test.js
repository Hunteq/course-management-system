const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  duration: {
    type: Number, 
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  passingMarks: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  batches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }],
  questions: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    marks: {
      type: Number,
      required: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Test', TestSchema);