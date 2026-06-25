# Quem leva a F1?

Simulador que estima a chance de cada piloto ser campeão ao final da temporada atual da Fórmula 1.

O projeto usa [simulações de Monte Carlo](https://pt.wikipedia.org/wiki/M%C3%A9todo_de_Monte_Carlo) para executar várias "temporadas alternativas" a partir da classificação atual e, com isso, calcular a probabilidade de título de cada piloto.

- [Quem leva a F1?](#quem-leva-a-f1)
  - [O que o projeto faz](#o-que-o-projeto-faz)
  - [De onde vem os dados](#de-onde-vem-os-dados)
  - [O que significam as configurações](#o-que-significam-as-configurações)
  - [Como interpretar a chance (%)](#como-interpretar-a-chance-)
  - [Limitações](#limitações)
  - [Stack](#stack)
  - [Como rodar](#como-rodar)
  - [Scripts](#scripts)

## O que o projeto faz

Ao abrir a aplicação, o app busca a classificação atual de pilotos e usa esses dados para simular o restante do campeonato. O resultado aparece como uma chance percentual de título para cada piloto.

Essa estimativa é baseada no estado atual da temporada e no número de corridas, sprints e simulações configurado pelo usuário.

## De onde vem os dados

Os dados são buscados da API pública `f1api.dev`:

- classificação atual de pilotos, incluindo pontos, posição e equipe
- último GP do ano, usado para calcular quantas etapas ainda faltam

Se a importação falhar, a interface exibe um indicativo de erro no topo da página principal.

## O que significam as configurações

- `Número de corridas`: quantas corridas restantes serão simuladas
- `Número de sprints`: quantas sprints restantes serão simuladas
- `Número de simulações`: quantas temporadas alternativas serão executadas

Quanto maior o número de simulações, mais estável tende a ser o resultado. Em compensação, o processamento pode levar mais tempo.

## Como interpretar a chance (%)

A chance representa a fração de simulações em que um piloto terminou como campeão, multiplicada por 100.

Exemplo: `23,50%` significa que, dentro do modelo atual, o piloto foi campeão em aproximadamente `23,5%` das temporadas simuladas.

## Limitações

Esta é uma estimativa simples e voltada para visualização. O modelo não considera fatores como:

- ritmo de corrida
- confiabilidade
- penalidades
- abandonos
- posição de grid
- características de cada pista

Use o resultado como uma referência divertida, não como previsão oficial.

## Stack

- Vue 3
- Vite
- Vuetify
- TypeScript
- pnpm

## Como rodar

Instale as dependências:

```bash
pnpm install
```

Inicie o ambiente de desenvolvimento:

```bash
pnpm dev
```

## Scripts

- `pnpm dev`: inicia o servidor de desenvolvimento
- `pnpm build`: executa a checagem de tipos e gera a build de produção
- `pnpm build-only`: gera a build sem rodar `type-check`
- `pnpm preview`: abre a build localmente para validação
- `pnpm type-check`: executa a checagem de tipos com `vue-tsc`
