// models/Inquiry.js example
const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: 'Not provided'
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: 'No Subject'
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied'],
    default: 'new'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inquiry', inquirySchema);