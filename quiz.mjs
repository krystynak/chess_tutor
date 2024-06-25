import { getTranscript, processTranscript} from './claude_service.mjs';
import { updateBoardPosition } from './script.mjs';

let currentQuestionIndex = 0;
let quizData = [];
let isDevelopmentMode = true;

console.log('quiz.mjs loaded');


document.addEventListener('DOMContentLoaded', () => {
    const devModeToggle = document.getElementById('devModeToggle');
    const videoUrlInput = document.getElementById('video-url');
    const submitQuizButton = document.getElementById('submit-quiz');
    const submitAnswerButton = document.getElementById('submit-answer');

    if (!devModeToggle) {
        console.error('Dev mode toggle element not found');
    } else {
        // Ensure the checkbox is checked
        devModeToggle.checked = true;
        
        devModeToggle.addEventListener('change', (e) => {
            isDevelopmentMode = e.target.checked;
            console.log('Development mode changed to:', isDevelopmentMode);
            
            if (isDevelopmentMode) {
                videoUrlInput.value = 'https://www.youtube.com/watch?v=1tqJZOzZX58';
            } else {
                videoUrlInput.value = '';
            }
        });
    }

    if (!videoUrlInput) {
        console.error('Video URL input element not found');
    }

    if (!submitQuizButton) {
        console.error('Submit quiz button not found');
    } else {
        submitQuizButton.addEventListener('click', checkAnswers);
    }

    if (!submitAnswerButton) {
        console.error('Submit answer button not found');
    } else {
        submitAnswerButton.addEventListener('click', submitAnswer);
    }

    console.log('Initial Development mode:', isDevelopmentMode);

    if (isDevelopmentMode && videoUrlInput) {
        videoUrlInput.value = 'https://www.youtube.com/watch?v=1tqJZOzZX58';
    }
});


// Function to check answers when user submits the quiz

function checkAnswers() {
    let score = 0;
    quizData.forEach((question, index) => {
        const userAnswer = document.getElementById(`answer-${index}`).value;
        if (userAnswer.toLowerCase() === question.answer.toLowerCase()) {
            score++;
        }
    });
    alert(`You scored ${score} out of ${quizData.length}`);
}


export async function startQuiz(videoId) {
    console.log(`startQuiz called from quiz.mjs with videoId: ${videoId}`);
    console.trace(); // This will print a stack trace

    try {
        console.log('Fetching transcript from API in startQuiz');
        const transcript = await getTranscript(videoId, isDevelopmentMode);

        // Log a snippet of the transcript
        console.log('Transcript snippet:');
        if (transcript && transcript.length > 0) {
            // Log the first 200 characters of the transcript
            console.log(transcript.slice(0, 200) + '...');
        } else {
            console.log('Transcript is empty or undefined');
        }
        
        quizData = await processTranscript(transcript);
        currentQuestionIndex = 0;
        showQuestion();
        showQuizContainer();
    } catch (error) {
        console.error('Error starting quiz:', error);
        document.getElementById('error-message').textContent = 'Error fetching transcript or processing quiz. Please try again.';
        document.getElementById('error-message').style.display = 'block';
    }
}

function showQuestion() {
    if (currentQuestionIndex >= quizData.length) {
        endQuiz();
        return;
    }

    const question = quizData[currentQuestionIndex];

    // Update the board position for the current question
    updateBoardPosition(question.fen);

    document.getElementById('question').textContent = question.question;
    document.getElementById('answer').value = '';
}

function showQuizContainer() {
    document.getElementById('quiz-container').style.display = 'block';
}

function submitAnswer() {
    const userAnswer = document.getElementById('answer').value;
    const correctAnswer = quizData[currentQuestionIndex].answer;
    
    // Here you can implement logic to check the answer and keep score
    // For now, we'll just move to the next question
    
    currentQuestionIndex++;
    showQuestion();
}

function endQuiz() {
    document.getElementById('quiz-container').style.display = 'none';
    alert('Quiz complete!');
    // Here you can add logic to display the final score
}


document.getElementById('devModeToggle').addEventListener('change', (e) => {
    isDevelopmentMode = e.target.checked;
});

// Add event listener for quiz submission
document.getElementById('submit-quiz').addEventListener('click', checkAnswers);
