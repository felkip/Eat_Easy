class AppReceitas {
    constructor(recipes) {
        this.recipes = recipes;
        this.ingredientesAdicionados = [];
        this.favoritosIds = this.carregarFavoritos();
        this.historicoSearches = this.carregarHistorico();
        this.filtroCategoria = [];
        this.filtroTempoMax = 120;
        this.categorias = [];
        this.loading = null;
        this.modal = null;
        this.modalClose = null;
        this.inputSuggestions = null;
        this.init();
    }

    init() {
        this.setupElementos();
        this.setupEventos();
        this.extrairCategoriasUnicas();
    }

    setupElementos() {
        const ingredienteInput = document.getElementById('ingredienteInput');
        const ingredientesTags = document.getElementById('ingredientesTags');
        const recipeGrid = document.getElementById('recipeGrid');
        const resultsSection = document.getElementById('resultsSection');
        const emptyState = document.getElementById('emptyState');
        const errorMessage = document.getElementById('errorMessage');

        if (!ingredienteInput || !ingredientesTags || !recipeGrid || !resultsSection || !emptyState || !errorMessage) {
            throw new Error('Alguns elementos obrigatórios não foram encontrados no DOM.');
        }

        this.ingredienteInput = ingredienteInput;
        this.ingredientesTags = ingredientesTags;
        this.recipeGrid = recipeGrid;
        this.resultsSection = resultsSection;
        this.emptyState = emptyState;
        this.errorMessage = errorMessage;
        this.loading = document.getElementById('loading');
        this.modal = document.getElementById('recipeModal');
        this.modalClose = document.querySelector('.modal-close');
        this.inputSuggestions = document.querySelector('.input-suggestions');
    }

    setupEventos() {
        this.ingredienteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.adicionarIngrediente();
                e.preventDefault();
            }
        });

        this.ingredienteInput.addEventListener('input', () => {
            this.atualizarSugestoes();
        });

        document.getElementById('btnSugerir')?.addEventListener('click', () => this.sugerirReceitas());
        document.getElementById('btnLimpar')?.addEventListener('click', () => this.limparTudo());

        this.modalClose?.addEventListener('click', () => this.fecharModal());
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.fecharModal();
            }
        });
    }

    extrairCategoriasUnicas() {
        const categorias = [...new Set(this.recipes.map((r) => r.categoria))];
        this.categorias = categorias.sort();
    }

    adicionarIngrediente() {
        const valor = this.ingredienteInput.value.trim();
        if (valor && !this.ingredientesAdicionados.includes(valor.toLowerCase())) {
            this.ingredientesAdicionados.push(valor.toLowerCase());
            this.ingredienteInput.value = '';
            this.atualizarTags();
            this.inputSuggestions?.classList.remove('active');
        }
    }

    removerIngrediente(index) {
        this.ingredientesAdicionados.splice(index, 1);
        this.atualizarTags();
    }

    atualizarTags() {
        this.ingredientesTags.innerHTML = '';
        this.ingredientesAdicionados.forEach((ing, index) => {
            const tag = document.createElement('div');
            tag.className = 'tag';
            tag.innerHTML = `
                <span>${ing}</span>
                <button type="button" aria-label="Remover ingrediente" onclick="app.removerIngrediente(${index})">×</button>
            `;
            this.ingredientesTags.appendChild(tag);
        });
    }

    atualizarSugestoes() {
        if (!this.inputSuggestions) {
            return;
        }

        const valor = this.ingredienteInput.value.trim().toLowerCase();

        if (valor.length < 2) {
            this.inputSuggestions.classList.remove('active');
            return;
        }

        const ingredientesUnicos = [...new Set(this.recipes.flatMap((r) => r.ingredientes.map((i) => i.toLowerCase())))];
        const matches = ingredientesUnicos
            .filter((ing) => ing.includes(valor) && !this.ingredientesAdicionados.includes(ing))
            .slice(0, 5);

        if (matches.length > 0) {
            this.inputSuggestions.innerHTML = matches
                .map((ing) => `<div class="suggestion-item" onclick="app.adicionarSugestao('${ing}')">${ing}</div>`)
                .join('');
            this.inputSuggestions.classList.add('active');
        } else {
            this.inputSuggestions.classList.remove('active');
        }
    }

    adicionarSugestao(ing) {
        this.ingredienteInput.value = '';
        if (!this.ingredientesAdicionados.includes(ing)) {
            this.ingredientesAdicionados.push(ing);
            this.atualizarTags();
        }
        this.inputSuggestions?.classList.remove('active');
    }

    normalizar(ingrediente) {
        return ingrediente.toLowerCase().trim();
    }

    calcularCompatibilidade(ingredientesRecipe) {
        const ingredientesNorm = new Set(this.ingredientesAdicionados.map((i) => this.normalizar(i)));
        const recipeNorm = new Set(ingredientesRecipe.map((i) => this.normalizar(i)));
        const comuns = [...ingredientesNorm].filter((i) => recipeNorm.has(i)).length;
        const percentual = ((comuns / recipeNorm.size) * 100).toFixed(0);
        return { percentual, comuns };
    }

    sugerirReceitas() {
        this.errorMessage.classList.remove('active');
        if (this.ingredientesAdicionados.length === 0) {
            this.mostrarErro('Por favor, adicione pelo menos um ingrediente!');
            return;
        }
        if (this.loading) {
            this.loading.style.display = 'block';
        }
        this.resultsSection.classList.remove('active');
        setTimeout(() => {
            const receitas = this.recipes
                .map((r) => ({ ...r, ...this.calcularCompatibilidade(r.ingredientes) }))
                .filter((r) => Number(r.percentual) >= 30)
                .sort((a, b) => Number(b.percentual) - Number(a.percentual));
            if (this.loading) {
                this.loading.style.display = 'none';
            }
            this.exibirResultados(receitas);
        }, 450);
    }

    exibirResultados(receitas) {
        const resultsTitle = document.getElementById('resultsTitle');
        const resultsInfo = document.getElementById('resultsInfo');
        if (!resultsTitle || !resultsInfo) {
            return;
        }
        resultsTitle.textContent = `Receitas Sugeridas (${receitas.length})`;
        resultsInfo.innerHTML = `
            <div class="result-stat">
                <span>📌 Ingredientes: <strong>${this.ingredientesAdicionados.join(', ')}</strong></span>
            </div>
            <div class="result-stat">
                <span>✓ ${receitas.length} receita${receitas.length !== 1 ? 's' : ''} encontrada${receitas.length !== 1 ? 's' : ''}</span>
            </div>
        `;
        this.recipeGrid.innerHTML = '';
        if (receitas.length === 0) {
            this.emptyState.style.display = 'block';
        } else {
            this.emptyState.style.display = 'none';
            receitas.forEach((receita) => {
                const card = this.criarCartaoReceita(receita);
                this.recipeGrid.appendChild(card);
            });
        }
        this.resultsSection.classList.add('active');
    }

    criarCartaoReceita(receita) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        const isFavorito = this.favoritosIds.includes(receita.id);
        const ingredientesHtml = receita.ingredientes
            .map((ing) => {
                const temIngrediente = this.ingredientesAdicionados.some((i) => this.normalizar(i) === this.normalizar(ing));
                const classe = temIngrediente ? '' : 'faltando';
                return `<li class="${classe}">${ing}</li>`;
            })
            .join('');
        card.innerHTML = `
            <div class="recipe-header">
                <div class="recipe-category">${receita.categoria}</div>
                <div class="recipe-title">${receita.nome}</div>
                <div class="compatibility-bar">
                    <div class="compatibility-fill" style="width: ${receita.percentual}%"></div>
                </div>
                <div class="compatibility-text">✓ ${receita.comuns}/${receita.ingredientes.length} ingredientes (${receita.percentual}%)</div>
            </div>
            <div class="recipe-body">
                <div class="recipe-section">
                    <h4>Ingredientes</h4>
                    <ul class="ingredientes-list">
                        ${ingredientesHtml}
                    </ul>
                </div>
                <div class="recipe-section">
                    <p class="modo-preparo">${receita.modo_preparo}</p>
                    <div class="tempo-preparo">⏱️ ${receita.tempo_preparo} min</div>
                </div>
                <div class="recipe-footer">
                    <button class="btn btn-small" type="button" onclick="app.abrirModal(${receita.id})">Ver Receita</button>
                    <button class="btn btn-small btn-favorite ${isFavorito ? 'active' : ''}" type="button" onclick="app.toggleFavorito(${receita.id})">❤️</button>
                </div>
            </div>
        `;
        return card;
    }

    abrirModal(receitaId) {
        if (!this.modal) {
            return;
        }
        const receita = this.recipes.find((r) => r.id === receitaId);
        if (!receita) {
            return;
        }
        const modalContent = this.modal.querySelector('.modal-content');
        if (!modalContent) {
            return;
        }
        const compat = this.calcularCompatibilidade(receita.ingredientes);
        const ingredientesHtml = receita.ingredientes
            .map((ing) => {
                const temIngrediente = this.ingredientesAdicionados.some((i) => this.normalizar(i) === this.normalizar(ing));
                const classe = temIngrediente ? '' : 'faltando';
                return `<li class="${classe}">${ing}</li>`;
            })
            .join('');
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>${receita.nome}</h2>
                <button class="modal-close" type="button">✕</button>
            </div>
            <div class="modal-body">
                <div class="modal-section">
                    <h3>Categoria</h3>
                    <p>${receita.categoria}</p>
                    <div class="compatibility-bar" style="margin-top: 10px;">
                        <div class="compatibility-fill" style="width: ${compat.percentual}%"></div>
                    </div>
                    <p style="margin-top: 10px; color: #666;">Você tem ${compat.comuns} de ${receita.ingredientes.length} ingredientes (${compat.percentual}%)</p>
                </div>
                <div class="modal-section">
                    <h3>Ingredientes</h3>
                    <ul class="ingredientes-list">
                        ${ingredientesHtml}
                    </ul>
                </div>
                <div class="modal-section">
                    <h3>Modo de Preparo</h3>
                    <p style="line-height: 1.8; color: #666;">${receita.modo_preparo}</p>
                </div>
                <div class="modal-section">
                    <h3>Informações</h3>
                    <p>⏱️ <strong>Tempo de preparo:</strong> ${receita.tempo_preparo} minutos</p>
                    <p style="margin-top: 10px;">📌 <strong>Dificuldade:</strong> Fácil</p>
                </div>
                <button class="btn btn-primary" type="button" onclick="app.fecharModal()" style="width: 100%;">Fechar</button>
            </div>
        `;
        const closeButton = modalContent.querySelector('.modal-close');
        closeButton?.addEventListener('click', () => this.fecharModal());
        this.modal.classList.add('active');
    }

    fecharModal() {
        this.modal?.classList.remove('active');
    }

    toggleFavorito(receitaId) {
        const index = this.favoritosIds.indexOf(receitaId);
        if (index > -1) {
            this.favoritosIds.splice(index, 1);
        } else {
            this.favoritosIds.push(receitaId);
        }
        this.salvarFavoritos();
        this.sugerirReceitas();
    }

    salvarFavoritos() {
        localStorage.setItem('favoritos', JSON.stringify(this.favoritosIds));
    }

    carregarFavoritos() {
        const saved = localStorage.getItem('favoritos');
        if (!saved) {
            return [];
        }
        try {
            return JSON.parse(saved);
        } catch {
            return [];
        }
    }

    salvarHistorico(search) {
        if (!this.historicoSearches.includes(search)) {
            this.historicoSearches.unshift(search);
            if (this.historicoSearches.length > 10) {
                this.historicoSearches.pop();
            }
            localStorage.setItem('historico', JSON.stringify(this.historicoSearches));
        }
    }

    carregarHistorico() {
        const saved = localStorage.getItem('historico');
        if (!saved) {
            return [];
        }
        try {
            return JSON.parse(saved);
        } catch {
            return [];
        }
    }

    aplicarFiltros() {
        const categoriasCheckadas = Array.from(document.querySelectorAll('.filter-item input[type="checkbox"]:checked')).map((cb) => cb.value);
        this.filtroCategoria = categoriasCheckadas;
        this.sugerirReceitas();
    }

    limparTudo() {
        this.ingredientesAdicionados = [];
        this.ingredienteInput.value = '';
        this.atualizarTags();
        this.resultsSection.classList.remove('active');
        this.inputSuggestions?.classList.remove('active');
    }

    mostrarErro(mensagem) {
        this.errorMessage.textContent = mensagem;
        this.errorMessage.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    window.app = new AppReceitas(window.RECIPES);
});
