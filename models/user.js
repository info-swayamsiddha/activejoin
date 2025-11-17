const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  interests: [{
    type: String,
    trim: true
  }],
  userType: {
    type: String,
    enum: ['individual', 'community'],
    default: 'individual'
  },
  profile: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);