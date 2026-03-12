import tkinter as tk
from tkinter import messagebox
import random

class Numpuz:
    def __init__(self, root):
        self.root = root
        self.root.title("Numpuz Premier")
        self.size = 3
        self.buttons = []
        self.board: list[int | None] = []
        self.empty_pos = (0, 0)
        
        self.grid_frame: tk.Frame | None = None
        self.setup_menu()
        self.init_game(3)

    def setup_menu(self):
        menu_frame = tk.Frame(self.root)
        menu_frame.pack(pady=10)
        
        options = [("3x3", 3), ("4x4", 4), ("5x5", 5), ("6x6", 6)]
        for text, size in options:
            btn = tk.Button(menu_frame, text=text, command=lambda s=size: self.init_game(s))
            btn.pack(side=tk.LEFT, padx=5)

    def init_game(self, size):
        self.size = size
        self.board = list(range(1, size**2)) + [None]
        self.shuffle_board()
        self.create_widgets()

    def shuffle_board(self):
        # Para garantir que o puzzle seja resolvível, fazemos movimentos aleatórios
        # a partir do estado resolvido em vez de um random.shuffle puro.
        for _ in range(1000):
            adj = self.get_adjacent(self.board.index(None))
            move = random.choice(adj)
            idx_none = self.board.index(None)
            self.board[idx_none], self.board[move] = self.board[move], self.board[idx_none]

    def get_adjacent(self, index):
        adj = []
        row, col = divmod(index, self.size)
        if row > 0: adj.append(index - self.size) # Cima
        if row < self.size - 1: adj.append(index + self.size) # Baixo
        if col > 0: adj.append(index - 1) # Esquerda
        if col < self.size - 1: adj.append(index + 1) # Direita
        return adj

    def create_widgets(self):
        if self.grid_frame:
            self.grid_frame.destroy()
            
        self.grid_frame = tk.Frame(self.root)
        self.grid_frame.pack(padx=20, pady=20)
        self.buttons = []
        
        for i, val in enumerate(self.board):
            row, col = divmod(i, self.size)
            btn_text = str(val) if val is not None else ""
            btn = tk.Button(self.grid_frame, text=btn_text, width=6, height=3,
                           font=('Arial', 14, 'bold'),
                           command=lambda idx=i: self.make_move(idx))
            btn.grid(row=row, column=col, sticky="nsew")
            if val is None:
                btn.config(state="disabled", bg="lightgrey")
            self.buttons.append(btn)

    def make_move(self, idx):
        none_idx = self.board.index(None)
        if idx in self.get_adjacent(none_idx):
            self.board[none_idx], self.board[idx] = self.board[idx], self.board[none_idx]
            self.update_buttons()
            if self.check_win():
                messagebox.showinfo("Parabéns!", "Você ordenou todos os números!")

    def update_buttons(self):
        for i, val in enumerate(self.board):
            btn_text = str(val) if val is not None else ""
            self.buttons[i].config(text=btn_text, state="normal" if val else "disabled",
                                 bg="white" if val else "lightgrey")

    def check_win(self):
        correct_board = list(range(1, self.size**2)) + [None]
        return self.board == correct_board

if __name__ == "__main__":
    root = tk.Tk()
    game = Numpuz(root)
    root.mainloop()
