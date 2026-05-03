# Eat Easy

Relembrando algumas ideias antigas, acabei criando um aplicativo frontend estático para sugerir receitas com base nos ingredientes que o usuário possui.

## Sobre

`Eat Easy` é um projeto simples em HTML, CSS e TypeScript. O usuário adiciona ingredientes que tem em casa e o app calcula receitas compatíveis, exibindo a correspondência e os ingredientes faltantes.

## Funcionalidades

- Interface leve, clara e responsiva
- Adição de ingredientes como tags para busca dinâmica
- Sugestões de receitas com base nos ingredientes informados
- Cards de receita interativos com hover visual
- Mensagem de estado quando não há receitas compatíveis

## Como executar

1. Abra um terminal no diretório do projeto.
2. Execute `npm install` para instalar o TypeScript.
3. Execute `npm run build` para compilar `static/app.ts` para `static/app.js`.
4. Abra `index.html` em um navegador moderno.

> Se quiser, use uma extensão de servidor local (como Live Server) para melhor desenvolvimento.

## Estrutura do projeto

- `index.html` — página principal com conteúdo e dados de receitas
- `static/style.css` — estilo visual e efeitos
- `static/app.ts` — lógica de tags, busca e exibição de receitas
- `static/app.js` — código compilado para o navegador
- `tsconfig.json` — configuração do compilador TypeScript
- `package.json` — script de build e dependência do TypeScript

## Observações

- O projeto é totalmente estático e não requer backend.
- As receitas estão definidas diretamente em `index.html` para facilitar testes.
- O visual foi pensado para ser mais claro e interativo.
