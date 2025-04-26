// models/Submission.js
const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  dob: {
    type: String,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  
  // Academic Background
  highestQualification: {
    type: String,
    required: true
  },
  graduationYear: {
    type: String,
    required: true
  },
  institution: {
    type: String,
    required: true
  },
  fieldOfStudy: {
    type: String,
    required: true
  },
  gpa: {
    type: String,
    required: true
  },
  englishTest: {
    type: String,
    default: 'Not specified'
  },
  englishScore: {
    type: String,
    default: 'Not specified'
  },
  
  // Study Preferences
  studyLevel: {
    type: String,
    required: true
  },
  intendedMajor: {
    type: String,
    required: true
  },
  studyCountry: {
    type: String,
    required: true
  },
  university: {
    type: String,
    default: 'Not specified'
  },
  intakeDate: {
    type: String,
    required: true
  },
  budget: {
    type: String,
    required: true
  },
  
  // Additional Details
  experience: {
    type: String,
    default: 'Not specified'
  },
  extracurricular: {
    type: String,
    default: 'Not specified'
  },
  goals: {
    type: String,
    required: true
  },
  additionalInfo: {
    type: String,
    default: 'Not specified'
  },
  
  // Metadata
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'completed', 'rejected'],
    default: 'new'
  },
  referredSchool: {
    type: String,
    default: ''
  },
  referredCourse: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);