class Numpuz {
    constructor() {
        console.log("Iniciando Numpuz 3x3...");
        this.gridElement = document.getElementById('puzzle-grid');
        this.moveElement = document.getElementById('move-count');
        this.timerElement = document.getElementById('timer');
        this.restartBtn = document.getElementById('restart-btn');
        this.gameOverElement = document.getElementById('game-over');
        this.finalMovesElement = document.getElementById('final-moves');
        this.finalTimeElement = document.getElementById('final-time');
        
        this.size = 3; // Fixo em 3x3
        this.tiles = [];
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isGameActive = false;

        this.init();
    }

    init() {
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => this.resetGame());
        }
        this.resetGame();
    }

    resetGame() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.moves = 0;
        this.timer = 0;
        this.isGameActive = true;
        this.updateStats();
        
        if (this.gameOverElement) {
            this.gameOverElement.classList.add('hidden');
        }
        
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
        this.tiles.push(null); // Espaço vazio
    }

    shuffleBoard() {
        let emptyIndex = this.tiles.indexOf(null);
        const iterations = 100; // Embaralha o suficiente para ser desafiador mas resolvível

        for (let i = 0; i < iterations; i++) {
            const neighbors = this.getNeighbors(emptyIndex);
            const moveIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // Troca física para garantir que o puzzle seja montável
            [this.tiles[emptyIndex], this.tiles[moveIndex]] = [this.tiles[moveIndex], this.tiles[emptyIndex]];
            emptyIndex = moveIndex;
        }
    }

    getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / this.size);
        const col = index % this.size;

        if (row > 0) neighbors.push(index - this.size); // Cima
        if (row < this.size - 1) neighbors.push(index + this.size); // Baixo
        if (col > 0) neighbors.push(index - 1); // Esquerda
        if (col < this.size - 1) neighbors.push(index + 1); // Direita

        return neighbors;
    }

    renderBoard() {
        if (!this.gridElement) return;
        
        this.gridElement.innerHTML = '';
        this.gridElement.style.display = 'grid';
        this.gridElement.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        this.gridElement.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
        this.gridElement.style.gap = '10px';

        this.tiles.forEach((value, index) => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            
            if (value === null) {
                tile.classList.add('empty');
                tile.textContent = '';
                // O espaço vazio não recebe evento de clique
            } else {
                tile.textContent = value;
                // Clique para mover
                tile.addEventListener('click', () => this.handleTileClick(index));
                // Estilo para indicar que é clicável
                tile.style.cursor = 'pointer';
            }
            this.gridElement.appendChild(tile);
        });
    }

    handleTileClick(index) {
        if (!this.isGameActive) return;

        const emptyIndex = this.tiles.indexOf(null);
        const neighbors = this.getNeighbors(index);

        // Se o espaço vazio estiver entre os vizinhos da peça clicada
        if (neighbors.includes(emptyIndex)) {
            console.log(`Movendo peça ${this.tiles[index]} para o espaço vazio`);
            
            // Realiza a troca (Move a peça para a casa ao lado vazia)
            [this.tiles[index], this.tiles[emptyIndex]] = [this.tiles[emptyIndex], this.tiles[index]];
            
            this.moves++;
            this.updateStats();
            this.renderBoard();

            if (this.checkWin()) {
                this.endGame();
            }
        } else {
            console.log("Peça não está ao lado do espaço vazio.");
        }
    }

    checkWin() {
        const winState = [1, 2, 3, 4, 5, 6, 7, 8, null];
        return this.tiles.every((val, i) => val === winState[i]);
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
        clearInterval(this.timerInterval);
        if (this.finalMovesElement) this.finalMovesElement.textContent = this.moves;
        if (this.finalTimeElement) this.finalTimeElement.textContent = this.timerElement.textContent;
        if (this.gameOverElement) this.gameOverElement.classList.remove('hidden');
    }
}

// Inicialização robusta
window.onload = () => {
    new Numpuz();
};
