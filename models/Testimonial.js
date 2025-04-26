const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: String,
  role: String,
  image: String,
  testimonial: String,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);