import pygame
import random

# Inicialização e Cores
pygame.font.init()

# Configurações do Jogo
COLUNAS, LINHAS = 15, 20
TAMANHO_BLOCO = 30
LARGURA_JOGO, ALTURA_JOGO = COLUNAS * TAMANHO_BLOCO, LINHAS * TAMANHO_BLOCO
LARGURA_TELA, ALTURA_TELA = 800, 700
X_INICIAL_JOGO = (LARGURA_TELA - LARGURA_JOGO) // 2
Y_INICIAL_JOGO = (ALTURA_TELA - ALTURA_JOGO) // 2

CORES = [
    (0, 0, 0), (0, 255, 255), (0, 0, 255), (255, 165, 0),
    (255, 255, 0), (0, 255, 0), (128, 0, 128), (255, 0, 0)
]

# Formatos das peças (S, Z, I, O, J, L, T)
FORMATOS = [
    [['.....', '.....', '..00.', '.00..', '.....'], ['.....', '..0..', '..00.', '...0.', '.....']], # S
    [['.....', '.....', '.00..', '..00.', '.....'], ['.....', '...0.', '..00.', '..0..', '.....']], # Z
    [['..0..', '..0..', '..0..', '..0..', '.....'], ['.....', '0000.', '.....', '.....', '.....']], # I
    [['.....', '.....', '.00..', '.00..', '.....']], # O
    [['.....', '.0...', '.000.', '.....', '.....'], ['.....', '..00.', '..0..', '..0..', '.....'], ['.....', '.....', '.000.', '...0.', '.....'], ['.....', '..0..', '..0..', '.00..', '.....']], # J
    [['.....', '...0.', '.000.', '.....', '.....'], ['.....', '..0..', '..0..', '..00.', '.....'], ['.....', '.....', '.000.', '.0...', '.....'], ['.....', '.00..', '..0..', '..0..', '.....']], # L
    [['.....', '..0..', '.000.', '.....', '.....'], ['.....', '..0..', '..00.', '..0..', '.....'], ['.....', '.....', '.000.', '..0..', '.....'], ['.....', '..0..', '.00..', '..0..', '.....']]  # T
]

class Peca:
    def __init__(self, x, y, formato):
        self.x = x
        self.y = y
        self.formato = formato
        self.cor = CORES[FORMATOS.index(formato) + 1]
        self.rotacao = 0

def criar_grade(posicoes_travadas={}):
    grade = [[(0,0,0) for _ in range(COLUNAS)] for _ in range(LINHAS)]
    for y in range(len(grade)):
        for x in range(len(grade[y])):
            if (x, y) in posicoes_travadas:
                grade[y][x] = posicoes_travadas[(x, y)]
    return grade

def converter_formato_peca(peca):
    posicoes = []
    formato = peca.formato[peca.rotacao % len(peca.formato)]
    for i, linha in enumerate(formato):
        for j, coluna in enumerate(linha):
            if coluna == '0':
                posicoes.append((peca.x + j - 2, peca.y + i - 3))
    return posicoes

def espaco_livre(peca, grade):
    pos_aceitaveis = [[(j, i) for j in range(COLUNAS) if grade[i][j] == (0,0,0)] for i in range(LINHAS)]
    pos_aceitaveis = [j for sub in pos_aceitaveis for j in sub]
    formatada = converter_formato_peca(peca)
    for pos in formatada:
        if pos not in pos_aceitaveis:
            if pos[1] > -1: return False
    return True

def desenhar_janela(superficie, grade):
    superficie.fill((0, 0, 0))
    for i in range(len(grade)):
        for j in range(len(grade[i])):
            pygame.draw.rect(superficie, grade[i][j], (X_INICIAL_JOGO + j*TAMANHO_BLOCO, Y_INICIAL_JOGO + i*TAMANHO_BLOCO, TAMANHO_BLOCO, TAMANHO_BLOCO), 0)
    pygame.draw.rect(superficie, (255, 0, 0), (X_INICIAL_JOGO, Y_INICIAL_JOGO, LARGURA_JOGO, ALTURA_JOGO), 4)

def main():
    posicoes_travadas = {}
    grade = criar_grade(posicoes_travadas)
    mudar_peca = False
    rodando = True
    peca_atual = Peca(COLUNAS // 2, 0, random.choice(FORMATOS))
    proxima_peca = Peca(COLUNAS // 2, 0, random.choice(FORMATOS))
    relogio = pygame.time.Clock()
    tempo_queda = 0
    velocidade_queda = 0.27

    janela = pygame.display.set_mode((LARGURA_TELA, ALTURA_TELA))

    while rodando:
        grade = criar_grade(posicoes_travadas)
        tempo_queda += relogio.get_rawtime()
        relogio.tick()

        if tempo_queda / 1000 >= velocidade_queda:
            tempo_queda = 0
            peca_atual.y += 1
            if not (espaco_livre(peca_atual, grade)) and peca_atual.y > 0:
                peca_atual.y -= 1
                mudar_peca = True

        for evento in pygame.event.get():
            if evento.type == pygame.QUIT:
                rodando = False
            if evento.type == pygame.KEYDOWN:
                if evento.key == pygame.K_LEFT:
                    peca_atual.x -= 1
                    if not espaco_livre(peca_atual, grade): peca_atual.x += 1
                if evento.key == pygame.K_RIGHT:
                    peca_atual.x += 1
                    if not espaco_livre(peca_atual, grade): peca_atual.x -= 1
                if evento.key == pygame.K_DOWN:
                    peca_atual.y += 1
                    if not espaco_livre(peca_atual, grade): peca_atual.y -= 1
                if evento.key == pygame.K_q: # Gira Esquerda
                    peca_atual.rotacao -= 1
                    if not espaco_livre(peca_atual, grade): peca_atual.rotacao += 1
                if evento.key == pygame.K_e: # Gira Direita
                    peca_atual.rotacao += 1
                    if not espaco_livre(peca_atual, grade): peca_atual.rotacao -= 1

        pos_peca = converter_formato_peca(peca_atual)
        for i in range(len(pos_peca)):
            x, y = pos_peca[i]
            if y > -1: grade[y][x] = peca_atual.cor

        if mudar_peca:
            for pos in pos_peca:
                posicoes_travadas[(pos[0], pos[1])] = peca_atual.cor
            peca_atual = proxima_peca
            proxima_peca = Peca(COLUNAS // 2, 0, random.choice(FORMATOS))
            mudar_peca = False

        desenhar_janela(janela, grade)
        pygame.display.update()

    pygame.display.quit()

if __name__ == "__main__":
    main()
