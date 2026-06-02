# CallKeeper

**Gerenciador de Fichas para Chamado de Cthulhu 7ª Edição**

## Sobre

CallKeeper é uma aplicação web para criação e gerenciamento de fichas de personagem
do sistema de RPG *Chamado de Cthulhu 7ª Edição*. Funciona inteiramente no navegador,
sem necessidade de servidor, banco de dados externo ou extensões.

## Funcionalidades

### Autenticação
- Sistema de login local (usuário e senha)
- Dados salvos no `localStorage` do navegador
- Múltiplos usuários no mesmo navegador

### Gerenciamento de Fichas
- Criar múltiplas fichas
- Exportar/Importar fichas em formato JSON
- Exportar todas as fichas ou individualmente
- Exclusão de fichas com confirmação

### Aba Principal
- Informações: Nome do Jogador, Personagem, Idade, Profissão
- Upload de retrato (redimensionado para 512×512)
- **9 Atributos**: FOR, CON, TAM, DES, APA, EDU, INT, POD, SOR
  - Cada atributo exibe: Valor | Metade (↓) | Quinto (↓)
- **Status automáticos**:
  - **PV**: Atual (editável) / Máximo = `(CON + TAM) / 5 ↓`
  - **PM**: Atual (editável) / Máximo = `POD / 5 ↓`
  - **Sanidade**: Atual (editável)
  - **Movimento**: Calculado por FOR, DES e TAM
  - **Dano Extra**: Calculado por FOR + TAM
  - **Corpo**: Calculado por FOR + TAM

### Aba de Perícias
- 80+ perícias do sistema com valores base entre parênteses
- Cada perícia: Valor editável | Metade (↓) | Quinto (↓)
- Esquivar base = metade da DES
- Língua Nativa base = EDU

### Aba de Inventário
- Adicionar itens com nome e descrição
- Checkbox para indicar posse do item
- Remover itens individualmente

### Aba de Armas
- Nome, Perícia, Dano, Munição, Usos por Rodada, Alcance, Defeito

### Aba de Magia
- Nome, Custo (valor + tipo PM/SAN), Tempo de Conjuração, Descrição

### Aba de Relações
- Relações interpessoais (nome + descrição)
- Informações pessoais: Descrição, Ideologia, Traços, Cicatrizes,
  Fobias, Tesouros, Encontros com Entidades, Backstory, Notas

## Cálculos

Todos os cálculos usam **arredondamento para baixo** (`Math.floor`).

### Movimento (MOV)
| Condição | MOV |
|---|---|
| FOR < TAM **e** DES < TAM | 7 |
| FOR ≥ TAM **ou** DES ≥ TAM **ou** todos iguais | 8 |
| FOR > TAM **e** DES > TAM | 9 |

### Dano Extra e Corpo
| FOR + TAM | Dano Extra | Corpo |
|---|---|---|
| 2 – 64 | –2 | –2 |
| 65 – 84 | –1 | –1 |
| 85 – 124 | Nenhum | 0 |
| 125 – 164 | +1D4 | 1 |
| 165 – 204 | +1D6 | 2 |
| 205 – 284 | +2D6 | 3 |
| 285 – 364 | +3D6 | 4 |
| 365 – 444 | +4D6 | 5 |
| 445 – 524 | +5D6 | 6 |
| 524+ | +1D6 e +1 Corpo a cada 80 pontos | ... |

## Como Usar

1. Faça upload de todos os arquivos para um repositório GitHub
2. Ative o **GitHub Pages** nas configurações do repositório
3. Acesse o site gerado pelo GitHub Pages
4. Crie uma conta (armazenada localmente) e comece a criar fichas

## Tecnologias

- HTML5, CSS3, JavaScript (Vanilla)
- LocalStorage para persistência
- Sem dependências externas
- Sem necessidade de servidor

## Estrutura
