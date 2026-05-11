const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Prevents two users from signing up with the same email
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt dates

module.exports = mongoose.model('User', userSchema);