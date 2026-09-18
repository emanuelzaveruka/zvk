# Redesign da home — plano de execução

Branch: `redesign/home`. Status: **aguardando a imagem de referência** antes da
implementação. Este documento é o plano original adaptado ao que existe de fato
no repositório, com as decisões já tomadas.

## Pendência que bloqueia o início

A primeira proposta visual (marca `ez.`, nome em duas linhas, foto circular à
direita) não foi anexada. O plano descreve cores, medidas, textos e estrutura em
detalhe suficiente para implementar, mas a fidelidade à composição não pode ser
verificada sem a imagem. Anexar antes de começar.

Não há navegador utilizável neste ambiente: o Chrome do Puppeteer não inicia por
falta de bibliotecas do sistema. A conferência visual será do autor, não minha —
capturas desktop/mobile não podem ser prometidas na entrega.

## Decisões tomadas

| Questão | Decisão |
| --- | --- |
| Bio completa (3 parágrafos hoje na home) | **Sai do site.** Sem página `/sobre`, sem seção equivalente. Os controles `Sobre` e `Sobre mim` do plano não são renderizados, conforme §5.6. O texto continua recuperável pelo histórico do Git. |
| Links sociais | **Três**: GitHub, LinkedIn, E-mail. O Discord sai da home e, como a home é o único lugar onde aparecia, deixa de existir no site. |
| Alcance das mudanças | **Somente a home.** Blog e post continuam exatamente como estão, com a navegação flutuante, o rodapé atual e as datas em inglês. |

Consequência aceita da terceira decisão: a home passa a ter uma linguagem visual
diferente do resto do site, e a formatação de data em português existirá em
paralelo à atual, sem substituí-la.

## O que já foi levantado no repositório

**Stack.** Astro 5 + Tailwind (plugin typography), pnpm 9.12.0. Fonte Poppins
auto-hospedada via `@fontsource` — mantida, sem instalar Geist ou Inter. Sem
lint e sem testes; a verificação é `pnpm build` seguido de `pnpm check:seo`.

**Projetos.** `src/data/project.json` já contém os dois projetos do mockup:

| Campo | User Dept | MS Email |
| --- | --- | --- |
| `prettyName` | User Dept | MS Email |
| `description` | Sistema (API REST) de usuários e departamentos em Java com Spring Boot. | Sistema de gerenciamento de emails em Java com Spring Boot. |
| destino | `github.com/emanuelzaveruka/userdept` | `github.com/emanuelzaveruka/msEmail` |

A stack está dentro da descrição, e não em um campo próprio. Para exibir
`Java / Spring Boot` separado, acrescentar um campo `tech` ao JSON — nenhum
processo automatizado reescreve esse arquivo, então é seguro editá-lo. `stars` e
`downloads` são zero e continuam ocultos: o plano proíbe indicadores inexistentes.

**Artigos.** `src/util/get-post.ts` expõe `indexablePosts` (apenas
`published: true`, já ordenados). Os dois primeiros alimentam a seção Escritos —
isso exclui rascunhos e também os `'preview'`, que é o comportamento correto para
uma listagem pública. `postPath()` constrói os links; `getReadTime()` fornece o
tempo de leitura.

**Destinos.** `/blog/` existe, então `Todos os textos` é renderizado. Não existe
listagem de projetos: `Todos os projetos` é omitido. Não existe `/sobre`:
omitido por decisão acima.

## Arquivos que serão alterados

Novos, todos sob `src/components/home/`:

| Arquivo | Responsabilidade |
| --- | --- |
| `site-header.astro` | Marca `ez.` com ponto azul e os links `Projetos` e `Escritos` (âncoras da própria home) |
| `hero.astro` | Eyebrow, `h1` em duas linhas, frase, descrição, `Ver projetos`, redes |
| `featured-projects.astro` | Índice `01`, título, grade dos dois cards |
| `project-tile.astro` | Card-link único: ícone, título, descrição, tecnologias |
| `writing-list.astro` | Índice `02`, título, `Todos os textos`, as duas linhas |
| `writing-row.astro` | Metadados pt-BR, título, seta, divisória |
| `home-footer.astro` | Divisória, nome à esquerda, `Vamos conversar` à direita |

Modificados:

| Arquivo | Mudança |
| --- | --- |
| `src/pages/index.astro` | Composição nova; passa `header={false}` e `footer={false}` ao layout para desligar a navegação flutuante e o rodapé compartilhado |
| `src/components/profile-image.astro` | Aceitar tamanho por prop (112–144 px no celular, 220–280 px no desktop); usado só na home |
| `src/data/project.json` | Campo `tech` nos dois projetos |
| `tailwind.config.mjs` | Tokens de cor do §4, com prefixo próprio para não colidir com as classes `neutral-*` usadas no resto do site |

Fora do escopo desta entrega: `document.astro`, `footer.astro`, `main-nav.astro`,
`time.astro`, `min-read.astro`, `section.astro`, as páginas de blog e post, o
`scripts/build-og-images.mjs` (o fundo `#171718` das cartas continua combinando
com o fundo atual das demais páginas).

## Conteúdo da home

| Elemento | Texto |
| --- | --- |
| Eyebrow | `DESENVOLVEDOR & ANALISTA DE SISTEMAS` |
| `h1` | `Emanuel` / `Zaveruka.` (segunda linha em azul) |
| Frase | `Conecto processos, sistemas e dados.` |
| Descrição | `Desenvolvimento, integrações e automação para resolver problemas reais.` |
| Ação | `Ver projetos` → `#projetos` |
| Redes | GitHub, LinkedIn, E-mail (destinos reais de `social-media.ts`) |
| Rodapé | `Emanuel Zaveruka` · `Vamos conversar` → `mailto:` já usado no site |

Data e tempo de leitura em português, no formato `17 set 2026 · 14 min de
leitura`, formatados a partir do `Date` do frontmatter com `pt-BR` e fuso fixo,
para a data publicada não deslizar um dia.

## Ordem de execução

1. Tokens e tipografia com escopo controlado.
2. Cabeçalho e apresentação, com a foto original e destinos reais.
3. Projetos e escritos, ligados às fontes existentes.
4. Rodapé da home e as faixas de 360, 390, 768, 1024 e 1440 px.
5. `pnpm build` e `pnpm check:seo` — o segundo é o portão real, e a home precisa
   continuar servindo seu próprio canonical, título e descrição.
6. Conferência das páginas de blog e post, para confirmar que nada vazou.

## Critérios de aceite

- [ ] Composição conforme a referência: nome grande, sobrenome azul, foto circular à direita no desktop, dois cards, artigos em linhas.
- [ ] Apenas um botão em destaque; os demais destinos são links discretos.
- [ ] Nenhum link aponta para `#` nem para URL inventada; controles sem destino real foram omitidos.
- [ ] Projetos e artigos vêm das fontes existentes; slugs, datas e conteúdo preservados.
- [ ] Rascunhos e `preview` não aparecem na home.
- [ ] Navegação por teclado funciona, com foco visível; sem rolagem horizontal nas larguras verificadas.
- [ ] Blog, post, 404, sitemap, feed e metadados intactos.
- [ ] `pnpm build` e `pnpm check:seo` verdes, com resultados relatados como foram.
- [ ] Nenhuma dependência nova; nada publicado em produção a partir desta branch.
