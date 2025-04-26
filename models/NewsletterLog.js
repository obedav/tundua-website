const mongoose = require('mongoose');

const newsletterLogSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  recipientCount: {
    type: Number,
    required: true
  },
  successCount: {
    type: Number,
    default: 0
  },
  errorCount: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NewsletterLog', newsletterLogSchema);