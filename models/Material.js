const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  filePath: {
    type: String,
    required: true
  },
  fileType: String,
  fileSize: Number,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Material', MaterialSchema);