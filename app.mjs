const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { YoutubeTranscript } = require('youtube-transcript');

dotenv.config();

const app = express();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/youtube/transcript', async (req, res) => {
  const { videoId } = req.query;
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    res.json({ transcript });
  } catch (error) {
    console.error('Error fetching transcript', error);
    res.status(500).json({ error: 'Failed to fetch transcript', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));