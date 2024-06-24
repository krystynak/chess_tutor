import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { YoutubeTranscript } from 'youtube-transcript';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Add your routes here
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/youtube/transcript', async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    res.json({ transcript });
  } catch (error) {
    console.error('Error fetching transcript', error);
    res.status(500).json({ error: 'Failed to fetch transcript', details: error.message });
  }
});

app.post('/api/process-transcript', async (req, res) => {
  const { transcript } = req.body;
  try {
    const quizData = await processTranscriptWithClaude(transcript);
    res.json(quizData);
  } catch (error) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ error: 'Failed to process transcript', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`App server running at http://localhost:${port}`);
});