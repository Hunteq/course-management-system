const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  timer: {
    type: Number // in minutes
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question'
  }],
  batches: [{
    type: Schema.Types.ObjectId,
    ref: 'Batch'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Test', TestSchema);