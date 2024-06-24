let board = null;
let game = new Chess();

function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false;
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function onDrop(source, target) {
    let move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });

    if (move === null) return 'snapback';
    updateStatus();
}

function onSnapEnd() {
    board.position(game.fen());
}

function updateStatus() {
    let status = '';
    let moveColor = 'White';
    if (game.turn() === 'b') {
        moveColor = 'Black';
    }

    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
    } else if (game.in_draw()) {
        status = 'Game over, drawn position';
    } else {
        status = moveColor + ' to move';
        if (game.in_check()) {
            status += ', ' + moveColor + ' is in check';
        }
    }

    $('#status').html(status);
}

let config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: 'img/chesspieces/{piece}.png'
};

board = Chessboard('myBoard', config);

updateStatus();

$('#startBtn').on('click', function() {
    board.start();
    game.reset();
    updateStatus();
});

$('#clearBtn').on('click', function() {
    board.clear();
    game.clear();
    updateStatus();
});

$('#setPositionBtn').on('click', function() {
    let fen = $('#fenInput').val();
    if (game.validate_fen(fen).valid) {
        board.position(fen);
        game.load(fen);
        updateStatus();
    } else {
        alert('Invalid FEN');
    }
});



async function generateQuizFromVideo(videoUrl) {
    // Show loading indicator
    showLoading(true);

    try {
        // Step 1: Extract video ID from URL
        const videoId = extractVideoId(videoUrl);

        // Step 2: Fetch transcript using our API endpoint
        const transcriptResponse = await fetch(`/api/youtube/transcript?videoId=${videoId}`);
        if (!transcriptResponse.ok) {
            throw new Error('Failed to fetch transcript');
        }
        const transcriptData = await transcriptResponse.json();
        const transcript = transcriptData.transcript.map(item => item.text).join(' ');

        // Step 3: Analyze transcript using Claude (simulated for now)
        const analysis = await analyzeTranscriptWithClaude(transcript);

        // Step 4: Generate quiz based on analysis
        const quizQuestions = generateQuizQuestions(analysis);

        // Step 5: Display quiz to user
        displayQuiz(quizQuestions);
    } catch (error) {
        console.error('Error generating quiz:', error);
        // Display error message to user
        displayError('Failed to generate quiz. Please try again.');
    } finally {
        // Hide loading indicator
        showLoading(false);
    }
}


// Add this function to handle form submission and quiz generation
document.getElementById('video-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const videoUrl = document.getElementById('video-url').value;
    await generateQuizFromVideo(videoUrl);
});

async function generateQuizFromVideo(videoUrl) {
    showLoading(true);

    try {
        const videoId = extractVideoId(videoUrl);
        const transcript = await fetchTranscript(videoId);
        
        // Here you would typically send the transcript to Claude for analysis
        // For now, let's just log it and create a simple quiz
        console.log('Transcript:', transcript);
        
        const quizQuestions = generateSimpleQuiz(transcript);
        displayQuiz(quizQuestions);
    } catch (error) {
        console.error('Error generating quiz:', error);
        displayError('Failed to generate quiz. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function fetchTranscript(videoId) {
    const response = await fetch(`/api/youtube/transcript?videoId=${videoId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch transcript');
    }
    const data = await response.json();
    return data.transcript.map(item => item.text).join(' ');
}

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function generateSimpleQuiz(transcript) {
    // This is a placeholder function. In reality, you'd use Claude to generate questions.
    const words = transcript.split(' ').filter(word => word.length > 5);
    const randomWords = words.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    return randomWords.map(word => ({
        question: `What is the definition of "${word}"?`,
        answer: "This is a placeholder answer. Claude would provide real answers."
    }));
}

function displayQuiz(questions) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = questions.map((q, i) => `
        <div class="question">
            <p>${i + 1}. ${q.question}</p>
            <button onclick="showAnswer(${i})">Show Answer</button>
            <p class="answer" id="answer-${i}" style="display: none;">${q.answer}</p>
        </div>
    `).join('');
}

function showAnswer(index) {
    const answerElement = document.getElementById(`answer-${index}`);
    answerElement.style.display = 'block';
}

function displayError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function showLoading(isLoading) {
    // Implement this function to show/hide a loading indicator
    console.log(isLoading ? 'Loading...' : 'Loading complete');
}

// ... (keep your existing chess game logic)
