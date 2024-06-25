import { startQuiz } from './quiz.mjs';
console.log('script.mjs loaded');
// Chess-related code
let board = null;
let game = new Chess();

function initializeBoard() {
    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        pieceTheme: 'img/chesspieces/{piece}.png'
    };
    board = Chessboard('myBoard', config);
}

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

// Quiz generation code
async function generateQuizFromVideo(event) {
    event.preventDefault();
    
    const videoUrl = document.getElementById('video-url').value;
    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
        displayError('Invalid YouTube URL. Please enter a valid URL.');
        return;
    }

    showLoading(true);
    hideError();

    try {
        await startQuiz(videoId);
        document.getElementById('quiz-container').style.display = 'block';
    } catch (error) {
        console.error('Error generating quiz:', error);
        displayError('Failed to generate quiz. Please try again.');
    } finally {
        showLoading(false);
    }
}

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function displayError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError() {
    document.getElementById('error-message').style.display = 'none';
}

function showLoading(isLoading) {
    // Implement this function to show/hide a loading indicator
    console.log(isLoading ? 'Loading...' : 'Loading complete');
}

// Set up event listeners when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeBoard();
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
            alert('Invalid FEN notation');
        }
    });

    document.getElementById('video-form').addEventListener('submit', generateQuizFromVideo);
});