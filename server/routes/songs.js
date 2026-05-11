const express = require('express');
const Song = require('../models/song');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply the auth middleware to protect all routes in this file
router.use(auth);

/**
 * @route POST /api/songs
 * @desc Create a new song
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const { title, artist, content } = req.body;

    const newSong = new Song({
      title,
      artist,
      content,
      user: req.user.userId // Sourced from the validated JWT
    });

    const savedSong = await newSong.save();
    res.status(201).json(savedSong);
  } catch (error) {
    console.error('Create Song Error:', error);
    res.status(500).json({ error: 'Failed to create song record' });
  }
});

/**
 * @route GET /api/songs
 * @desc Get all songs for the authenticated user
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find({ user: req.user.userId }).sort({ updatedAt: -1 });
    res.json(songs);
  } catch (error) {
    console.error('Fetch Songs Error:', error);
    res.status(500).json({ error: 'Failed to retrieve songs' });
  }
});

/**
 * @route GET /api/songs/:id
 * @desc Get a single song by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findOne({ _id: req.params.id, user: req.user.userId });

    if (!song) {
      return res.status(404).json({ error: 'Song not found or unauthorized access' });
    }

    res.json(song);
  } catch (error) {
    console.error('Fetch Single Song Error:', error);
    res.status(500).json({ error: 'Failed to retrieve the song' });
  }
});

/**
 * @route PUT /api/songs/:id
 * @desc Update an existing song
 * @access Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, artist, content } = req.body;

    const updatedSong = await Song.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { title, artist, content },
      { new: true, runValidators: true }
    );

    if (!updatedSong) {
      return res.status(404).json({ error: 'Song not found or unauthorized access' });
    }

    res.json(updatedSong);
  } catch (error) {
    console.error('Update Song Error:', error);
    res.status(500).json({ error: 'Failed to update the song' });
  }
});

/**
 * @route DELETE /api/songs/:id
 * @desc Delete a song
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedSong = await Song.findOneAndDelete({ _id: req.params.id, user: req.user.userId });

    if (!deletedSong) {
      return res.status(404).json({ error: 'Song not found or unauthorized access' });
    }

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Delete Song Error:', error);
    res.status(500).json({ error: 'Failed to delete the song' });
  }
});

module.exports = router;