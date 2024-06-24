import dotenv from 'dotenv';
import { google } from 'googleapis';
import fetch from 'node-fetch';

dotenv.config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

console.log('YouTube API Key:', process.env.YOUTUBE_API_KEY);

async function getYouTubeTranscript(videoId) {
  try {
    // First, get the available caption tracks
    const trackListUrl = `https://www.youtube.com/api/timedtext?type=list&v=${videoId}`;
    const trackListResponse = await fetch(trackListUrl);
    const trackListText = await trackListResponse.text();

    // Parse the XML response to get the first caption track
    const match = trackListText.match(/lang_code="([^"]+)"/);
    if (!match) {
      throw new Error('No captions found for this video');
    }
    const langCode = match[1];

    // Now fetch the actual transcript
    const transcriptUrl = `https://www.youtube.com/api/timedtext?lang=${langCode}&v=${videoId}`;
    const transcriptResponse = await fetch(transcriptUrl);
    const transcriptText = await transcriptResponse.text();

    // Parse the XML to extract just the text
    const plainText = transcriptText
      .replace(/<text[^>]*>/g, '\n')
      .replace(/<\/text>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .trim();

    return plainText;
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error);
    throw error;
  }
}

async function testClaudeAPI(videoUrl) {
  const videoId = new URL(videoUrl).searchParams.get('v');
  const transcript = await getYouTubeTranscript(videoId);
  console.log('Transcript:', transcript);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const apiEndpoint = 'https://api.anthropic.com/v1/messages';

  try {
    console.log('Sending request to Claude API...');
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 40000,
        messages: [{
          role: "user",
          content: `Here's a transcript of a YouTube video about chess: "${transcript}". Please summarize the key points discussed about the Caro-Kann defense.`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response received from Claude API:');
    console.log(data.content[0].text);
    return data.content[0].text;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Usage
const videoUrl = 'https://www.youtube.com/watch?v=1tqJZOzZX58';
testClaudeAPI(videoUrl)
  .then(() => console.log('Test completed'))
  .catch(error => console.error('Test failed:', error));