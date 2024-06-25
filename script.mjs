import { startQuiz } from './quiz.mjs';
console.log('script.mjs loaded');
// Chess-related code
let board = null;
let isWhiteOnBottom = true;  // track orientation
let game = new Chess();

function initializeBoard() {
    console.log('initializeBoard called');
    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        orientation: 'white',
        pieceTheme: 'img/chesspieces/{piece}.png'
    };
    board = Chessboard('myBoard', config);
}

// Add this function to invert the board
function invertBoard() {
    if (board) {
        isWhiteOnBottom = !isWhiteOnBottom;
        board.orientation(isWhiteOnBottom ? 'white' : 'black');
    }
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
    console.log('updateStatus called');
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


function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}


// Modify your updateBoardPosition function to maintain orientation
export function updateBoardPosition(fen) {
    if (board) {
        board.position(fen);
        board.orientation(isWhiteOnBottom ? 'white' : 'black');
    } else {
        console.error('Board is not initialized in script.mjs');
    }
}


// Set up event listeners when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded'); 
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

    const invertButton = document.getElementById('invertBoard');
    if (invertButton) {
        invertButton.addEventListener('click', invertBoard);
    }

    const form = document.getElementById('video-form');
  
    if (form) {
      console.log('Form found');
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log('Form submitted');
        const videoUrl = document.getElementById('video-url').value;
        const videoId = extractVideoId(videoUrl);
        if (videoId) {
          startQuiz(videoId);
        } else {
          alert('Invalid YouTube URL');
        }
      });
    } else {
      console.error('Form not found');
    }


});
