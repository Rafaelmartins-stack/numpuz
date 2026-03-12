const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

const ROWS = 10;
const COLS = 10;
const BLOCK_SIZE = canvas.width / COLS;

let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let score = 0;
let highScore = localStorage.getItem('gridstack_highscore') || 0;
let gameOver = false;
let currentPiece = null;
let nextPiece = null;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

highScoreElement.innerText = highScore;

const SHAPES = {
    'I': { shape: [[1, 1, 1, 1]], color: '#00f2ff' },
    'J': { shape: [[1, 0, 0], [1, 1, 1]], color: '#0070ff' },
    'L': { shape: [[0, 0, 1], [1, 1, 1]], color: '#ff8c00' },
    'O': { shape: [[1, 1], [1, 1]], color: '#f0ff00' },
    'S': { shape: [[0, 1, 1], [1, 1, 0]], color: '#00ff40' },
    'T': { shape: [[0, 1, 0], [1, 1, 1]], color: '#7000ff' },
    'Z': { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff0040' },
    'DOT': { shape: [[1]], color: '#ffffff' },
    'LINE3': { shape: [[1, 1, 1]], color: '#00f2ff' },
    'SQUARE3': { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: '#ff00ff' }
};

const SHAPE_KEYS = Object.keys(SHAPES);

function createPiece() {
    const key = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
    const piece = JSON.parse(JSON.stringify(SHAPES[key]));
    return {
        ...piece,
        pos: { x: Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2), y: 0 }
    };
}

function drawBlock(ctx, x, y, color, size = BLOCK_SIZE) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
    
    // Add some highlights/borders for depth
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x * size, y * size, size, size);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x * size, y * size, size, size / 4);
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * BLOCK_SIZE, 0);
        ctx.lineTo(i * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * BLOCK_SIZE);
        ctx.lineTo(canvas.width, i * BLOCK_SIZE);
        ctx.stroke();
    }

    grid.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(ctx, x, y, value);
            }
        });
    });
}

function drawPiece(ctx, piece, offset = { x: 0, y: 0 }, size = BLOCK_SIZE) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(ctx, piece.pos.x + x + offset.x, piece.pos.y + y + offset.y, piece.color, size);
            }
        });
    });
}

function collide(grid, piece) {
    const [m, o] = [piece.shape, piece.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (grid[y + o.y] && grid[y + o.y][x + o.x]) !== null) {
                return true;
            }
            // Check bounds
            if (m[y][x] !== 0 && (x + o.x < 0 || x + o.x >= COLS || y + o.y >= ROWS)) {
                return true;
            }
        }
    }
    return false;
}

function merge(grid, piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                grid[y + piece.pos.y][x + piece.pos.x] = piece.color;
            }
        });
    });
    score += 10; // Point for positioning
    updateScore();
}

function clearLines() {
    let rowsToClear = [];
    let colsToClear = [];

    // Check rows
    for (let y = 0; y < ROWS; y++) {
        if (grid[y].every(cell => cell !== null)) {
            rowsToClear.push(y);
        }
    }

    // Check columns
    for (let x = 0; x < COLS; x++) {
        let full = true;
        for (let y = 0; y < ROWS; y++) {
            if (grid[y][x] === null) {
                full = false;
                break;
            }
        }
        if (full) {
            colsToClear.push(x);
        }
    }

    const lines = rowsToClear.length;
    const cols = colsToClear.length;

    if (lines > 0 || cols > 0) {
        // Clearing logic: unlike tetris, we just set to null, no falling
        rowsToClear.forEach(y => {
            for (let x = 0; x < COLS; x++) grid[y][x] = null;
        });
        colsToClear.forEach(x => {
            for (let y = 0; y < ROWS; y++) grid[y][x] = null;
        });

        // Score: (Lines + Columns) * 100 * Multiplier
        // Combo: If lines > 0 AND cols > 0, extra bonus
        let bonus = (lines > 0 && cols > 0) ? 500 : 0;
        let points = (lines + cols) * 100 + bonus;
        score += points;
        updateScore();
    }
}

function updateScore() {
    scoreElement.innerText = score;
    if (score > highScore) {
        highScore = score;
        highScoreElement.innerText = highScore;
        localStorage.setItem('gridstack_highscore', highScore);
    }
}

function drop() {
    currentPiece.pos.y++;
    if (collide(grid, currentPiece)) {
        currentPiece.pos.y--;
        merge(grid, currentPiece);
        clearLines();
        resetPiece();
    }
    dropCounter = 0;
}

function move(dir) {
    currentPiece.pos.x += dir;
    if (collide(grid, currentPiece)) {
        currentPiece.pos.x -= dir;
    }
}

function resetPiece() {
    currentPiece = nextPiece;
    nextPiece = createPiece();
    
    if (collide(grid, currentPiece)) {
        gameOver = true;
        showGameOver();
    }
    drawNextPiece();
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    const size = 25;
    const offsetX = (nextCanvas.width - nextPiece.shape[0].length * size) / 2 / size;
    const offsetY = (nextCanvas.height - nextPiece.shape.length * size) / 2 / size;
    
    nextPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(nextCtx, x + offsetX, y + offsetY, nextPiece.color, size);
            }
        });
    });
}

function showGameOver() {
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.innerText = score;
}

function update(time = 0) {
    if (gameOver) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        drop();
    }

    drawGrid();
    drawPiece(ctx, currentPiece);
    requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
    if (gameOver) return;
    
    if (event.keyCode === 37) { // Left
        move(-1);
    } else if (event.keyCode === 39) { // Right
        move(1);
    } else if (event.keyCode === 40) { // Down
        drop();
    }
});

restartBtn.addEventListener('click', () => {
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    score = 0;
    gameOver = false;
    updateScore();
    gameOverScreen.classList.add('hidden');
    init();
    update();
});

function init() {
    nextPiece = createPiece();
    resetPiece();
}

init();
update();
