# Chess Video Quiz Generator

This application generates chess quizzes based on YouTube chess video transcripts. It uses AI to analyze the transcript and create relevant questions with chess positions.

## Features

- Fetch YouTube video transcripts
- Generate chess quizzes based on video content
- Display chess positions using FEN notation
- Interactive quiz interface

## Files

### app.mjs

This is the main server file. It sets up an Express.js server and handles the following:
- Serves the static files for the frontend
- Provides API endpoints for fetching YouTube transcripts and processing them
- Interfaces with the Anthropic API to generate quiz questions

### quiz.mjs

This file contains the frontend logic for the quiz interface. It handles:
- Displaying quiz questions and chess positions
- Managing user interactions and scoring
- Transitioning between questions

### script.mjs

This file contains the main frontend JavaScript code. It's responsible for:
- Handling user input for YouTube video URLs
- Fetching transcripts and initiating quiz generation
- Managing the overall flow of the application on the client side

### proxy_server.mjs

This file sets up a proxy server to handle CORS issues when fetching YouTube transcripts. It:
- Forwards requests to YouTube's transcript API
- Handles any necessary request modifications or error handling

### claude_service.mjs

This file provides a service layer for interacting with the Anthropic Claude API. It:
- Manages API requests to Claude
- Handles response parsing and error handling
- Provides a clean interface for other parts of the application to use Claude's capabilities

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables (API keys, etc.)
4. Run the server with `node app.mjs`
5. Access the application in your web browser at `http://localhost:3000`

## Usage

1. Enter a YouTube chess video URL
2. Click "Generate Quiz"
3. Answer the generated chess questions
4. View your score at the end of the quiz

## Dependencies

- Express.js
- Anthropic API
- Chess.js (for chess logic)
- Chessboard.js (for chess board visualization)

## License

This project is licensed under the MIT License.
