
import { getTranscript, processTranscript, getLocalTranscript } from './claude_service.mjs';

let currentQuestionIndex = 0;
let quizData = [];

console.log('quiz.mjs loaded');


document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    const devModeToggle = document.getElementById('devModeToggle');
    devModeToggle.addEventListener('change', (e) => {
        isDevelopmentMode = e.target.checked;
        console.log('Development mode:', isDevelopmentMode);
    });

    document.getElementById('video-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const videoUrl = document.getElementById('video-url').value;
        const videoId = extractVideoId(videoUrl);
        if (videoId) {
            document.getElementById('error-message').style.display = 'none';
            await startQuiz(videoId);
        } else {
            document.getElementById('error-message').textContent = 'Invalid YouTube URL';
            document.getElementById('error-message').style.display = 'block';
        }
    });
});


async function startQuiz(videoId) {
    console.log('startQuiz called with videoId:', videoId);
    console.log('isDevelopmentMode:', isDevelopmentMode);

    try {
        let transcript;
        if (isDevelopmentMode) {
            console.log('Using local transcript file');
            transcript = await getLocalTranscript();
        } else {
            console.log('Fetching transcript from API');
            transcript = await getTranscript(videoId);
        }
        quizData = await processTranscript(transcript);
        showQuestion();
    } catch (error) {
        console.error('Error starting quiz:', error);
        document.getElementById('error-message').textContent = 'Error fetching transcript or processing quiz. Please try again.';
        document.getElementById('error-message').style.display = 'block';
    }
}
function showQuestion() {
    const question = quizData[currentQuestionIndex];
    board = Chessboard('myBoard', { position: question.fen, draggable: true });
    document.getElementById('question').textContent = question.question;
}

function checkAnswer() {
    const userAnswer = document.getElementById('answer').value;
    const correctAnswer = quizData[currentQuestionIndex].answer;
    const resultElement = document.getElementById('result');
    
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        resultElement.textContent = "Correct!";
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            showQuestion();
        } else {
            resultElement.textContent = "Quiz completed!";
        }
    } else {
        resultElement.textContent = "Incorrect. Try again.";
    }
}

document.getElementById('video-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const videoUrl = document.getElementById('video-url').value;
    const videoId = extractVideoId(videoUrl);
    if (videoId) {
        await startQuiz(videoId);
    } else {
        document.getElementById('error-message').textContent = 'Invalid YouTube URL';
        document.getElementById('error-message').style.display = 'block';
    }
});

let isDevelopmentMode = false;

document.getElementById('devModeToggle').addEventListener('change', (e) => {
    isDevelopmentMode = e.target.checked;
});

document.getElementById('submit-answer').addEventListener('click', checkAnswer);

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export { startQuiz };