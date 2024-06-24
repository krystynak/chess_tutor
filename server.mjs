import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/get-transcript', async (req, res) => {
    const { videoUrl } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const apiEndpoint = 'https://api.anthropic.com/v1/messages';

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-sonnet-20240229",
                max_tokens: 4096,
                messages: [{
                    role: "user",
                    content: `Please provide a transcript of the YouTube video at this URL: ${videoUrl}. Focus on the chess-related content and key points discussed about the Caro-Kann defense.`
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.json({ transcript: data.content[0].text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch video transcript' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});