import { getTranscript, processTranscript} from './claude_service.mjs';

let currentQuestionIndex = 0;
let quizData = [];
let isDevelopmentMode = true;

console.log('quiz.mjs loaded');


document.addEventListener('DOMContentLoaded', () => {
    const devModeToggle = document.getElementById('devModeToggle');
    const videoUrlInput = document.getElementById('video-url');
    const submitQuizButton = document.getElementById('submit-quiz');

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

    console.log('Initial Development mode:', isDevelopmentMode);

    if (isDevelopmentMode && videoUrlInput) {
        videoUrlInput.value = 'https://www.youtube.com/watch?v=1tqJZOzZX58';
    }
});


// Function to check answers when user submits the quiz
function checkAnswers() {
    const quizContainer = document.getElementById('quiz-container');
    const questions = quizContainer.querySelectorAll('.question');
    let score = 0;

    questions.forEach((questionDiv, index) => {
        const selectedOption = questionDiv.querySelector('input:checked');
        if (selectedOption) {
            const userAnswer = parseInt(selectedOption.value);
            if (userAnswer === questions[index].correctAnswer) {
                score++;
                questionDiv.style.color = 'green';
            } else {
                questionDiv.style.color = 'red';
            }
        }
    });

    alert(`You scored ${score} out of ${questions.length}`);
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


document.getElementById('devModeToggle').addEventListener('change', (e) => {
    isDevelopmentMode = e.target.checked;
});

// Add event listener for quiz submission
document.getElementById('submit-quiz').addEventListener('click', checkAnswers);

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}