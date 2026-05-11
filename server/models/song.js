const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    trim: true,
    default: 'Unknown Artist'
  },
  content: {
    type: String, 
    required: true,
    // This will store your lyrics and chord diagrams. 
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This links the song directly to a specific user's ID
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);