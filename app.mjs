import express from 'express';
import fs from 'fs/promises';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { YoutubeTranscript } from 'youtube-transcript';
import path from 'path';
import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Use your Claude API key
});

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json( {limit: '2mb'}));
app.use(express.urlencoded({ limit: '2mb', extended: true }));


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

app.get('/api/local-transcript', async (req, res) => {
  const videoId = req.query.videoId;
  try {
    const transcript = await fs.readFile(path.join('transcripts', `${videoId}.json`), 'utf-8');
    res.send(transcript);
  } catch (error) {
    console.error('Error reading local transcript file:', error);
    res.status(500).send('Error reading local transcript file');
  }
});


// Add a new route to handle transcript processing
app.post('/api/process-transcript', async (req, res) => {
  try {
    const { transcript } = req.body;
    const prompt = `
    Analyze this chess video transcript and create a quiz with 3 questions:
    ${transcript}
    
    For each question, provide:
    1. A chess position in FEN notation
    2. A question about the position
    3. The correct answer
    
    Please ensure the questions cover key chess concepts of positions in the transcript and vary in difficulty.
    Format your response as a JSON array of objects, each with keys: fen, question, answer
`;

  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL,
    max_tokens: 40000,
    messages: [{ role: "user", content: prompt }]
  });

  // Parse the JSON response
  const parsedResult = JSON.parse(message.content[0].text);

res.json(parsedResult);
 
  } catch (error) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ error: 'An error occurred while processing the transcript' });
  }
});

app.listen(port, () => {
  console.log(`App server running at http://localhost:${port}`);
});