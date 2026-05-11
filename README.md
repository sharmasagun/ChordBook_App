# 🎸 ChordBook

Hey there! Welcome to **ChordBook**, a simple and clean place to keep all your song chords and lyrics in one spot. Whether you're a beginner learning your first few chords or a pro transcribing your next masterpiece, this app is designed to stay out of your way and let you focus on the music.

## What can it do?
- **Safe & Secure**: Create your own account to keep your personal library private.
- **Easy Composing**: Use our built-in chord helper to quickly drop chords like `[Am]` or `[G]` right into your lyrics.
- **Practice Mode**: Open any song in full-screen with auto-scroll and transposition tools (perfect for when you need to change the key on the fly!).
- **Cloud Library**: Your songs are stored in the cloud, so you can access them from anywhere.

## How to get it running
I've kept the setup as simple as possible. Just follow these steps:

1.  **Install dependencies**: Open your terminal in this folder and run:
    ```bash
    npm install
    ```
2.  **Set up your environment**: Make sure you have a `.env` file in this main folder with your database credentials (it should look like the one provided).
3.  **Launch the app**:
    ```bash
    npm start
    ```
4.  **Go play!**: Open your browser and head to `http://localhost:5000`.

## Tech Stuff (for the curious)
- **Frontend**: Pure HTML, CSS, and JavaScript. No bulky frameworks here—just clean, fast code.
- **Backend**: Powered by Express.js and Node.js.
- **Database**: We use MongoDB Atlas (Cloud) so you don't have to install anything locally.
- **Security**: Passwords are hashed with Bcrypt and sessions are handled with JWT.

Hope you enjoy using ChordBook as much as I enjoyed building it! 🎶
