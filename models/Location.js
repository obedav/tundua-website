const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Location', locationSchema);