class Numpuz {
    constructor() {
        console.log("Iniciando Numpuz 7x7...");
        this.gridElement = document.getElementById('puzzle-grid');
        this.moveElement = document.getElementById('move-count');
        this.timerElement = document.getElementById('timer');
        this.startScreen = document.getElementById('start-screen');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.gameOverElement = document.getElementById('game-over');
        this.finalMovesElement = document.getElementById('final-moves');
        this.finalTimeElement = document.getElementById('final-time');
        
        this.size = 7; // Agora 7x7
        this.tiles = [];
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isGameActive = false;
        this.gameStarted = false;

        this.init();
    }

    init() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.startGame());
        }
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => this.startGame());
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (!this.gameStarted || !this.isGameActive) {
                    this.startGame();
                }
            }
        });

        this.createBoard();
        this.shuffleBoard();
        this.renderBoard();
    }

    startGame() {
        this.gameStarted = true;
        this.isGameActive = true;
        this.moves = 0;
        this.timer = 0;
        
        if (this.startScreen) this.startScreen.classList.add('hidden');
        if (this.gameOverElement) this.gameOverElement.classList.add('hidden');
        
        this.createBoard();
        this.shuffleBoard();
        this.renderBoard();
        this.updateStats();
        
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.startTimer();
    }

    createBoard() {
        this.tiles = [];
        const totalTiles = this.size * this.size;
        for (let i = 1; i < totalTiles; i++) {
            this.tiles.push(i);
        }
        this.tiles.push(null); 
    }

    shuffleBoard() {
        let emptyIndex = this.tiles.indexOf(null);
        // Aumentando iterações para um grid 7x7
        const iterations = 500; 
        for (let i = 0; i < iterations; i++) {
            const neighbors = this.getNeighbors(emptyIndex);
            const moveIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
            [this.tiles[emptyIndex], this.tiles[moveIndex]] = [this.tiles[moveIndex], this.tiles[emptyIndex]];
            emptyIndex = moveIndex;
        }
    }

    getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / this.size);
        const col = index % this.size;
        if (row > 0) neighbors.push(index - this.size);
        if (row < this.size - 1) neighbors.push(index + this.size);
        if (col > 0) neighbors.push(index - 1);
        if (col < this.size - 1) neighbors.push(index + 1);
        return neighbors;
    }

    renderBoard() {
        if (!this.gridElement) return;
        this.gridElement.innerHTML = '';
        this.gridElement.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        this.gridElement.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
        
        this.tiles.forEach((value, index) => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            // Ajuste de fonte para grid 7x7
            tile.style.fontSize = '1.1rem'; 
            
            if (value === null) {
                tile.classList.add('empty');
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
            const mins = Math.floor(this.timer / 60).toString().padStart(2, '0');
            const secs = (this.timer % 60).toString().padStart(2, '0');
            this.timerElement.textContent = `${mins}:${secs}`;
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
        this.gameStarted = false;
        clearInterval(this.timerInterval);
        if (this.finalMovesElement) this.finalMovesElement.textContent = this.moves;
        if (this.finalTimeElement) this.finalTimeElement.textContent = this.timerElement.textContent;
        if (this.gameOverElement) this.gameOverElement.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Numpuz();
});
