import express from 'express';
import fs from 'fs/promises';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { YoutubeTranscript } from 'youtube-transcript';
import path from 'path';
import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';

dotenv.config();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Use your Claude API key
});



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json( {limit: '2mb'}));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



// Add your routes here
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/youtube/transcript', async (req, res) => {
  const { videoId } = req.query;
  console.log('Fetching youtube transcript for video ID:', videoId);
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
  console.log('Fetching local transcript for video ID:', videoId);

  if (!videoId) {
    console.error('No videoId provided');
    return res.status(400).json({ error: 'Video ID is required' });
  }

  const filePath = path.join(__dirname, 'transcripts', `${videoId}.json`);
  console.log('Attempting to read file:', filePath);

  try {
    // Check if file exists
    await fs.access(filePath);

    const transcriptRaw = await fs.readFile(filePath, 'utf-8');
    
    console.log('Raw transcript content:', transcriptRaw.substring(0, 200) + '...');
    console.log('Transcript type:', typeof transcriptRaw);
    console.log('Transcript length:', transcriptRaw.length);

    if (!transcriptRaw || transcriptRaw.trim() === '') {
      console.error('Transcript file is empty');
      return res.status(404).json({ error: 'Transcript file is empty' });
    }

    // Try parsing the JSON
    let transcriptParsed;
    try {
      transcriptParsed = JSON.parse(transcriptRaw);
      console.log('Parsed transcript type:', typeof transcriptParsed);
      console.log('Parsed transcript structure:', JSON.stringify(transcriptParsed).substring(0, 200) + '...');
    } catch (parseError) {
      console.error('Invalid JSON in transcript file:', parseError);
      return res.status(500).json({ error: 'Invalid JSON in transcript file' });
    }

    console.log('Successfully read transcript file');
    
    // Send the parsed transcript as a string
    res.json(transcriptParsed);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Transcript file not found:', filePath);
      res.status(404).json({ error: 'Transcript file not found' });
    } else {
      console.error('Error reading local transcript file:', error);
      res.status(500).json({ error: 'Error reading local transcript file', details: error.message });
    }
  }
});

app.post('/api/process-transcript', async (req, res) => {
  console.log('Received request to /api/process-transcript');
  try {
    let { transcript } = req.body;
    console.log('Received transcript type:', typeof transcript);

    if (!transcript) {
      console.error('No transcript provided in request body');
      return res.status(400).json({ error: 'No transcript provided' });
    }

    let transcriptText;
    if (typeof transcript === 'object' && transcript.transcript && Array.isArray(transcript.transcript)) {
      // Extract the text from each segment and join them
      transcriptText = transcript.transcript.map(segment => segment.text).join(' ');
    } else if (typeof transcript === 'string') {
      transcriptText = transcript;
    } else {
      console.error('Unexpected transcript format:', JSON.stringify(transcript).substring(0, 200));
      return res.status(400).json({ error: 'Unexpected transcript format' });
    }

    console.log('Processed transcript type:', typeof transcriptText);
    console.log('Transcript length:', transcriptText.length);
    console.log('Transcript preview:', transcriptText.substring(0, 200));

    // Truncate the transcript if it's too long
    const maxLength = 15000; // Adjust this value as needed
    if (transcriptText.length > maxLength) {
      transcriptText = transcriptText.substring(0, maxLength) + "...";
      console.log(`Transcript truncated to ${maxLength} characters`);
    }
    
    const prompt = `
    Analyze this chess video transcript and create a quiz with 3 questions:
    ${transcriptText}
    
    For each question, provide:
    1. A chess position in FEN notation
    2. A question about the position
    3. The correct answer
    
    Please ensure the questions cover key chess concepts of positions in the transcript and vary in difficulty.
    Format your response as a JSON array of objects, each with keys: fen, question, answer
    `;

    console.log('Sending request to Anthropic API: ', prompt);
    const message = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }]
    });

    console.log('Received response from Anthropic API');
    console.log('Raw API response:', message.content[0].text);

    // Parse the JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(message.content[0].text);
    } catch (parseError) {
      console.error('Error parsing Anthropic API response:', parseError);
      return res.status(500).json({ error: 'Failed to parse API response' });
    }

    console.log('Successfully processed transcript and created quiz');
    res.json(parsedResult);
  } catch (error) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ error: 'An error occurred while processing the transcript', details: error.message });
  }
});