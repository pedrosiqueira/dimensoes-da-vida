# Projeto de Aplicativo de Gráfico Radar

## Requisitos e Fluxos de Tela

O app se chamará Dimensões da Vida e inicialmente será um site para criar e comparar gráficos de radar. Cada usuário (membro da turma) responde a uma enquete (valores numéricos), gerando um gráfico de radar pessoal. Em seguida pode-se comparar esse gráfico com a média da turma ou com gráficos individuais de outros membros. Abaixo resumimos as telas e fluxos:

- **(A) Boas-vindas (login)**: Na primeira vez, exibe botão de login Google (OAuth). Após autenticação, se ainda não tem cadastrado, solicita um apelido para exibição (nome do Google por padrão). Depois segue para a tela (B).
- **(B) Explorar Enquetes**: Mostra uma lista de enquetes disponíveis (título, descrição, data de criação). Cada item tem botão “Participar” que leva à tela (C).
- **(C) Enquete (formulário)**: Exibe título/descrição da enquete e um campo inteiro de zero a dez obrigatório para cada pergunta (eixo do gráfico de radar), com validação front e back-end. Só depois de passar na validação frontend habilita-se o botão “Gerar Gráfico”, que, quando clicado, aparece modal de opções de compartilhamento (com ícone que abre tooltip): (i) público (tooltip vejo os resultados dos outros e vice-versa), (ii) anônimo (só vejo a média dos resultados, mas ninguém vê meu resultado).
- **(D) Enquete (detalhes)**: Mostra o gráfico radar pessoal concluído, data de conclusão e:
  - Botão de alternância “Comparar com outros/Remover comparação”: ao ativar, exibe (atrás) um carrossel de gráficos radar da (i) média de todos os participantes que completaram a enquete, (ii) média de todos os participantes que completaram a enquete e possuem o mesmo nome de turma, (iii) cada participante da turma (caso tenha habilitado compartilhamento público).
  - Campo “Minha turma” com campo “Salvar”.
  - Botão “Ver enquete”: expande para mostrar a enquete.
  - Botão “Imprimir enquete”.
  - Botão “Excluir enquete”: confirmação para remover a própria resposta.
- **(E) Tela Inicial (Dashboard)**: Tela exibida ao entrar no app se já estiver autenticado. Exibe um carrossel dos últimos gráficos respondidos (do mais recente ao mais antigo), indicando data de conclusão e botão “Abrir” (tela D). Se ainda não respondeu nenhum gráfico, o carrossel não aparece. Exibe botões de navegação: “Minhas Enquetes” (F), “Explorar Enquetes” (B) e “Perfil” (G).
- **(F) Minhas enquetes**: Lista todas as enquetes do usuário, com data de conclusão, e botões “Abrir” (tela D) ou “Excluir” para cada item.
- **(G) Perfil**: Campo para editar o apelido do usuário, que fica desabilitado, e um botão “Alterar” que (i) habilita o campo, (ii) exibe outro botão cancelar e (iii) muda de alterar para salvar. Botões de logout e exclusão de conta.

## Modelo Relacional Inicial

- **Usuário**: id, google_id (para login), nome (apelido), data_criacao, data_edicao.
- **Enquete**: id, título, descrição, id_criador, data_criacao, data_edicao.
- **Pergunta/Eixo**: id, enquete_id, título (tag no gráfico), descrição, posicao (ordem do eixo), data_criacao, data_edicao. Cada pergunta corresponde a uma dimensão do radar.
- **Turma/Enquete respondida**: id, usuario_id, enquete_id, nome, nivel_compartilhamento (público ou anônimo), data_conclusao. Essa tabela representa enquetes respondidas. O usuário pode ter a mesma enquete respondida várias vezes, e cada resposta pode ter apenas uma turma associada por vez (campo “Minha turma” da tela (D)).
- **Resposta**: id, usuario_id, turma_id, pergunta_id, valor (inteiro de zero a dez).

## Validações e Regras de Negócio

- **Nome da turma:** Não diferenciar caixa, salvar como minúsculo. Indexar o campo em banco para buscas rápidas. Cada usuário pode ter apenas uma turma por enquete respondida, apesar que pode responder a mesma enquete várias vezes.
- **Nome do usuário:** O apelido exibido não precisa ser único, mas deve ter tamanho entre 2 e 32.
- **Exclusão:** Antes de excluir, confirmar ação. Usar soft-delete.

## Nomes, Arquitetura SvelteKit e Tecnologias

**Arquitetura SvelteKit:** Para o banco de dados, será usado o [Drizzle ORM](https://orm.drizzle.team). O SvelteKit servirá endpoints (em `+server.js/ts`) que executam consultas via Drizzle.

## Incrementos Futuros

- **Formatos alternativos:** Permitir outras visualizações (como **gráfico radial de barras** ou **stellar chart**), mas inicialmente o radar clássico atende bem ao propósito de “comparação de desempenho”.
- **Modo anônimo:** Permitir responder sem login (avisando que resultados não serão comparados com turma). Nesse caso, salvar respostas em _localStorage_ ou cookies. Com login, migrar os dados locais para o servidor quando o usuário fizer login.
- **Salvar rascunho:** Permitir pausar e retomar o preenchimento da enquete. Por exemplo, guardar um objeto parcial no backend ou _sessionStorage_.
- **Filtros avançados:** Na tela de explorar gráficos, adicionar busca por título, data ou turma, e paginação.
- **Mais tipos de enquetes:** Em vez de ter apenas “gráfico de radar”, permitir outros formatos (por exemplo, escalas pontuadas, matrizes) no futuro. Nesse caso, armazenar também o tipo de visualização (radar, barra, etc.).
- **CRUD de enquetes:** Liberar para admins (ou usuários) a criação de novas enquetes. Habilitar telas de cadastro/edição de enquete, definindo suas perguntas/eixos e escalas.

## Dev

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

### Creating a project

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv@0.16.1 create --template minimal --types ts --add prettier eslint sveltekit-adapter="adapter:vercel" drizzle="database:sqlite+sqlite:better-sqlite3" better-auth="demo:password,github" mcp="ide:vscode,other+setup:local" --install pnpm dimensoes-da-vida
```

### 🧩 Add-on steps

mcp: - For other clients: https://svelte.dev/docs/mcp/local-setup#Other-clients
drizzle: - Check DATABASE_URL in .env and adjust it to your needs - Run pnpm run db:push to update your database schema
better-auth: - Run pnpm run auth:schema to generate the auth schema - Run pnpm run db:push to update your database - Check ORIGIN & BETTER_AUTH_SECRET in .env and adjust it to your needs - Set your GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env - Visit /demo/better-auth route to view the demo

Stuck? Visit us at https://svelte.dev/chat

### Developing

Once you've created a project and installed dependencies with `pnpm install`, start a development server:

```sh
pnpm run dev --open
```

To close the dev server, hit Ctrl-C

### Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## dúvidas

`return fail(400, { message: 'Nome deve ter entre 2 e 32 caracteres' });` não estava funcionando. provavelmente os outros casos que retornam fail tbm não estão.
