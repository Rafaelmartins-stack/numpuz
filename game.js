class Numpuz {
    constructor() {
        this.gridElement = document.getElementById('puzzle-grid');
        this.moveElement = document.getElementById('move-count');
        this.timerElement = document.getElementById('timer');
        this.restartBtn = document.getElementById('restart-btn');
        this.gameOverElement = document.getElementById('game-over');
        this.finalMovesElement = document.getElementById('final-moves');
        this.finalTimeElement = document.getElementById('final-time');
        
        this.size = 3;
        this.tiles = [];
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isGameActive = false;

        this.init();
    }

    init() {
        // Difficulty buttons
        const diffButtons = document.querySelectorAll('.diff-btn');
        diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                diffButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.size = parseInt(btn.dataset.size);
                this.resetGame();
            });
        });

        this.restartBtn.addEventListener('click', () => this.resetGame());
        this.resetGame();
    }

    resetGame() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.moves = 0;
        this.timer = 0;
        this.isGameActive = true;
        this.updateStats();
        this.gameOverElement.classList.add('hidden');
        
        this.createBoard();
        this.shuffleBoard();
        this.renderBoard();
        this.startTimer();
    }

    createBoard() {
        this.tiles = [];
        const totalTiles = this.size * this.size;
        for (let i = 1; i < totalTiles; i++) {
            this.tiles.push(i);
        }
        this.tiles.push(null); // Empty space
    }

    shuffleBoard() {
        // To guarantee solvability, we simulate random valid moves
        // instead of a truly random shuffle.
        let emptyIndex = this.tiles.indexOf(null);
        const iterations = this.size * this.size * 50;

        for (let i = 0; i < iterations; i++) {
            const neighbors = this.getNeighbors(emptyIndex);
            const moveIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // Swap
            [this.tiles[emptyIndex], this.tiles[moveIndex]] = [this.tiles[moveIndex], this.tiles[emptyIndex]];
            emptyIndex = moveIndex;
        }
    }

    getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / this.size);
        const col = index % this.size;

        if (row > 0) neighbors.push(index - this.size); // Up
        if (row < this.size - 1) neighbors.push(index + this.size); // Down
        if (col > 0) neighbors.push(index - 1); // Left
        if (col < this.size - 1) neighbors.push(index + 1); // Right

        return neighbors;
    }

    renderBoard() {
        if (!this.gridElement) return;
        this.gridElement.innerHTML = '';
        this.gridElement.style.display = 'grid';
        this.gridElement.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        this.gridElement.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
        this.gridElement.style.gap = '10px';
        this.gridElement.style.width = '100%';
        this.gridElement.style.height = '100%';

        this.tiles.forEach((value, index) => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            if (value === null) {
                tile.classList.add('empty');
                tile.textContent = '';
            } else {
                tile.textContent = value;
                tile.addEventListener('click', () => this.handleTileClick(index));
            }
            this.gridElement.appendChild(tile);
        });
    }

    handleTileClick(index) {
        if (!this.isGameActive) return;

        const emptyIndex = this.tiles.indexOf(null);
        const neighbors = this.getNeighbors(index);

        if (neighbors.includes(emptyIndex)) {
            // Move tile
            [this.tiles[index], this.tiles[emptyIndex]] = [this.tiles[emptyIndex], this.tiles[index]];
            this.moves++;
            this.updateStats();
            this.renderBoard();

            if (this.checkWin()) {
                this.endGame();
            }
        }
    }

    checkWin() {
        for (let i = 0; i < this.tiles.length - 1; i++) {
            if (this.tiles[i] !== i + 1) return false;
        }
        return this.tiles[this.tiles.length - 1] === null;
    }

    updateStats() {
        if (this.moveElement) this.moveElement.textContent = this.moves;
        if (this.timerElement) {
            const mins = Math.floor(this.timer / 60);
            const secs = this.timer % 60;
            this.timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.isGameActive) {
                this.timer++;
                this.updateStats();
            }
        }, 1000);
    }

    endGame() {
        this.isGameActive = false;
        clearInterval(this.timerInterval);
        
        if (this.finalMovesElement) this.finalMovesElement.textContent = this.moves;
        if (this.finalTimeElement) this.finalTimeElement.textContent = this.timerElement.textContent;
        if (this.gameOverElement) this.gameOverElement.classList.remove('hidden');
    }
}

// Start game
document.addEventListener('DOMContentLoaded', () => {
    new Numpuz();
});
