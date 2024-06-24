import { ChatGPTAPI } from 'chatgpt';

const api = new ChatGPTAPI({
  apiKey: process.env.CLAUDE_API_KEY
});

export async function getTranscript(videoId) {
    const response = await fetch(`http://localhost:5500/api/youtube/transcript?videoId=${videoId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch transcript: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

export async function getLocalTranscript() {
    try {
        const data = await fs.readFile('caro_test_transcript.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading local transcript file:', error);
        throw new Error('Failed to read local transcript file');
    }
}

export async function processTranscript(transcript) {
    const prompt = `
        Analyze this chess video transcript and create a quiz with 3 questions:
        ${transcript}
        
        For each question, provide:
        1. A chess position in FEN notation
        2. A question about the position
        3. The correct answer
        
        Format your response as a JSON array of objects, each with keys: fen, question, answer
    `;

    try {
        const response = await api.sendMessage(prompt);
        return JSON.parse(response.text);
    } catch (error) {
        console.error('Error processing transcript with Claude:', error);
        throw new Error('Failed to process transcript with AI');
    }
}