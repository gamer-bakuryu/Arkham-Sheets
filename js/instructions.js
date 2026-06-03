/**
 * CallKeeper — Módulo de Instruções
 * Gerencia o modal de boas-vindas e instruções em múltiplas páginas.
 */

var Instructions = (function() {

    var SEEN_KEY_PREFIX = 'callkeeper_instructions_seen_';
    var currentPage = 0;
    var pages = [];

    /**
     * Define o conteúdo de todas as páginas de instrução.
     */
    function buildPages() {
        pages = [
            // Página 1 — Boas-vindas
            {
                title: 'Bem-vindo ao CallKeeper!',
                content:
                    '<p>Este é o seu gerenciador de fichas para <strong>Call of Cthulhu 7ª Edição</strong>, ' +
                    'com algumas adaptações para tornar o sistema um pouco menos punitivo que o original.</p>' +
                    '<p>Aqui você pode criar, editar e salvar quantas fichas quiser, tudo de forma prática ' +
                    'e direta no seu navegador.</p>' +
                    '<div class="highlight-box">' +
                    'Suas fichas são salvas automaticamente conforme você edita. Você também pode ' +
                    '<strong>exportar</strong> e <strong>importar</strong> fichas em formato de arquivo ' +
                    'para fazer backup ou compartilhar com outros jogadores.' +
                    '</div>' +
                    '<p>Nas próximas páginas você encontrará as instruções de como gerar os atributos ' +
                    'e distribuir os pontos de perícia do seu personagem.</p>' +
                    '<p><em>Boa sorte, investigador. Que os Antigos tenham piedade da sua sanidade.</em></p>'
            },

            // Página 2 — Atributos: Rolagem
            {
                title: 'Gerando Atributos — Métodos de Rolagem',
                content:
                    '<h3>Método de Rolagem Padrão</h3>' +
                    '<p>Para os atributos <strong>Força (FOR)</strong>, <strong>Constituição (CON)</strong>, ' +
                    '<strong>Destreza (DES)</strong>, <strong>Aparência (APA)</strong> e <strong>Poder (POD)</strong>, ' +
                    'role <strong>3D6</strong> e multiplique o resultado por <strong>5</strong>.</p>' +
                    '<p>Para os atributos <strong>Tamanho (TAM)</strong>, <strong>Inteligência (INT)</strong> e ' +
                    '<strong>Educação (EDU)</strong>, role <strong>2D6+6</strong> e multiplique o resultado por <strong>5</strong>.</p>' +
                    '<div class="highlight-box">' +
                    'Os valores obtidos podem ser atribuídos livremente a qualquer atributo que você desejar, ' +
                    'sem necessidade de seguir a ordem em que foram rolados.' +
                    '</div>' +
                    '<h3>Método de Rolagem Alternativo</h3>' +
                    '<p>Role <strong>4D6</strong> para cada atributo e descarte o dado de menor valor. ' +
                    'Multiplique o resultado dos três dados restantes por <strong>5</strong>. ' +
                    'Esse método tende a gerar personagens um pouco mais competentes.</p>' +
                    '<p>Não se esqueça de também gerar o atributo <strong>Sorte (SOR)</strong>, ' +
                    'que segue as mesmas regras de rolagem dos atributos básicos (3D6 × 5).</p>'
            },

            // Página 3 — Atributos: Tiro Rápido
            {
                title: 'Gerando Atributos — Tiro Rápido',
                content:
                    '<h3>Método de Tiro Rápido</h3>' +
                    '<p>Se você prefere pular as rolagens e ir direto ao ponto, utilize o seguinte ' +
                    'conjunto de valores pré-definidos:</p>' +
                    '<div class="values-list">' +
                    '<span class="value-badge">40</span>' +
                    '<span class="value-badge">50</span>' +
                    '<span class="value-badge">50</span>' +
                    '<span class="value-badge">50</span>' +
                    '<span class="value-badge">60</span>' +
                    '<span class="value-badge">60</span>' +
                    '<span class="value-badge">70</span>' +
                    '<span class="value-badge">80</span>' +
                    '</div>' +
                    '<p>Distribua cada um desses valores entre os atributos da forma que considerar ' +
                    'mais adequada para o seu personagem. Cada valor deve ser usado uma única vez.</p>' +
                    '<div class="highlight-box gold">' +
                    '<strong>Dica:</strong> Após preencher seus atributos, os campos de Pontos de Vida, ' +
                    'Pontos de Magia, Sanidade, Movimento, Dano Extra e Corpo serão calculados ' +
                    'automaticamente pelo sistema. Basta preencher os atributos e tudo será atualizado em tempo real.' +
                    '</div>'
            },

            // Página 4 — Perícias
            {
                title: 'Distribuindo Pontos de Perícia',
                content:
                    '<h3>Calculando seus Pontos</h3>' +
                    '<p>Após definir seus atributos, é hora de calcular quantos pontos você tem para ' +
                    'investir nas perícias. O total é calculado da seguinte forma:</p>' +
                    '<div class="highlight-box">' +
                    '<strong>Total de Pontos = (EDU × 5) + (INT × 2)</strong>' +
                    '</div>' +
                    '<p>Pegue o valor do seu atributo de <strong>Educação (EDU)</strong> e multiplique por cinco. ' +
                    'Em seguida, pegue o valor do seu atributo de <strong>Inteligência (INT)</strong> e multiplique por dois. ' +
                    'Some os dois resultados — esse é o total de pontos que você pode distribuir.</p>' +
                    '<h3>Como Distribuir</h3>' +
                    '<p>Os pontos investidos devem ser <strong>somados ao valor base</strong> já existente em cada perícia. ' +
                    'Por exemplo, se a perícia <strong>Escutar</strong> possui um valor base de <strong>20%</strong> e você ' +
                    'decide investir <strong>30 pontos</strong> nela, o valor final será <strong>50%</strong>.</p>' +
                    '<div class="highlight-box gold">' +
                    'Os valores base de cada perícia estão indicados entre parênteses ao lado do nome na aba de ' +
                    '<strong>Perícias</strong>. As colunas de <strong>Metade</strong> e <strong>Quinto</strong> ' +
                    'são calculadas automaticamente conforme você preenche os valores.' +
                    '</div>' +
                    '<p><em>Agora você está pronto para criar seu investigador. Boa jogatina!</em></p>'
            }
        ];
    }

    /**
     * Abre o modal de instruções na primeira página.
     */
    function open() {
        buildPages();
        currentPage = 0;
        renderCurrentPage();
        document.getElementById('instructions-overlay').classList.add('active');
    }

    /**
     * Fecha o modal.
     */
    function close() {
        document.getElementById('instructions-overlay').classList.remove('active');
    }

    /**
     * Renderiza a página atual do modal.
     */
    function renderCurrentPage() {
        var page = pages[currentPage];
        document.getElementById('modal-title').textContent = page.title;
        document.getElementById('modal-body').innerHTML = page.content;

        // Scroll para o topo do body
        var body = document.getElementById('modal-body');
        body.scrollTop = 0;

        // Atualizar dots
        var dotsContainer = document.getElementById('modal-dots');
        dotsContainer.innerHTML = '';
        for (var i = 0; i < pages.length; i++) {
            var dot = document.createElement('span');
            dot.className = 'modal-dot' + (i === currentPage ? ' active' : '');
            dot.dataset.page = i;
            dot.addEventListener('click', function() {
                currentPage = parseInt(this.dataset.page);
                renderCurrentPage();
            });
            dotsContainer.appendChild(dot);
        }

        // Atualizar botões
        var prevBtn = document.getElementById('modal-prev');
        var nextBtn = document.getElementById('modal-next');

        if (currentPage === 0) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'inline-flex';
        }

        if (currentPage === pages.length - 1) {
            nextBtn.textContent = 'Concluir ✓';
        } else {
            nextBtn.textContent = 'Próximo →';
        }
    }

    /**
     * Vai para a próxima página ou fecha se for a última.
     */
    function nextPage() {
        if (currentPage < pages.length - 1) {
            currentPage++;
            renderCurrentPage();
        } else {
            close();
        }
    }

    /**
     * Volta para a página anterior.
     */
    function prevPage() {
        if (currentPage > 0) {
            currentPage--;
            renderCurrentPage();
        }
    }

    /**
     * Verifica se o usuário já viu as instruções.
     */
    function hasSeenInstructions(username) {
        var key = SEEN_KEY_PREFIX + username.toLowerCase().trim();
        return localStorage.getItem(key) === 'true';
    }

    /**
     * Marca que o usuário já viu as instruções.
     */
    function markAsSeen(username) {
        var key = SEEN_KEY_PREFIX + username.toLowerCase().trim();
        localStorage.setItem(key, 'true');
    }

    /**
     * Mostra instruções para novos usuários (primeiro login).
     */
    function showForNewUser(username) {
        if (!hasSeenInstructions(username)) {
            markAsSeen(username);
            // Pequeno delay para a tela de fichas renderizar primeiro
            setTimeout(function() {
                open();
            }, 400);
        }
    }

    /**
     * Inicializa os event listeners do modal.
     */
    function init() {
        document.getElementById('modal-close').addEventListener('click', close);
        document.getElementById('modal-next').addEventListener('click', nextPage);
        document.getElementById('modal-prev').addEventListener('click', prevPage);

        // Fechar clicando fora do modal
        document.getElementById('instructions-overlay').addEventListener('click', function(e) {
            if (e.target === this) {
                close();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                var overlay = document.getElementById('instructions-overlay');
                if (overlay.classList.contains('active')) {
                    close();
                }
            }
        });

        // Botão de instruções no header
        var instrBtn = document.getElementById('btn-instructions');
        if (instrBtn) {
            instrBtn.addEventListener('click', open);
        }
    }

    return {
        init: init,
        open: open,
        close: close,
        showForNewUser: showForNewUser
    };
})();
