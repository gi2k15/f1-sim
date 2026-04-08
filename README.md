# f1-sim

Simulador que estima a chance de cada piloto ser campeao ao final da temporada atual da Formula 1.

O projeto usa simulacoes de Monte Carlo para executar varias "temporadas alternativas" a partir da classificacao atual e, com isso, calcular a probabilidade de titulo de cada piloto.

## O que o projeto faz

Ao abrir a aplicacao, o app busca a classificacao atual de pilotos e usa esses dados para simular o restante do campeonato. O resultado aparece como uma chance percentual de titulo para cada piloto.

Essa estimativa e baseada no estado atual da temporada e no numero de corridas, sprints e simulacoes configurado pelo usuario.

## De onde vem os dados

Os dados sao buscados da API publica `f1api.dev`:

- classificacao atual de pilotos, incluindo pontos, posicao e equipe
- ultimo GP do ano, usado para calcular quantas etapas ainda faltam

Se a importacao falhar, a interface exibe um indicativo de erro no topo da pagina principal.

## O que significam as configuracoes

- `Numero de corridas`: quantas corridas restantes serao simuladas
- `Numero de sprints`: quantas sprints restantes serao simuladas
- `Numero de simulacoes`: quantas temporadas alternativas serao executadas

Quanto maior o numero de simulacoes, mais estavel tende a ser o resultado. Em compensacao, o processamento pode levar mais tempo.

## Como interpretar a chance (%)

A chance representa a fracao de simulacoes em que um piloto terminou como campeao, multiplicada por 100.

Exemplo: `23,50%` significa que, dentro do modelo atual, o piloto foi campeao em aproximadamente `23,5%` das temporadas simuladas.

## Limitacoes

Esta e uma estimativa simples e voltada para visualizacao. O modelo nao considera fatores como:

- ritmo de corrida
- confiabilidade
- penalidades
- abandonos
- posicao de grid
- caracteristicas de cada pista

Use o resultado como uma referencia divertida, nao como previsao oficial.

## Stack

- Vue 3
- Vite
- Vuetify
- TypeScript
- pnpm

## Como rodar

Instale as dependencias:

```bash
pnpm install
```

Inicie o ambiente de desenvolvimento:

```bash
pnpm dev
```

## Scripts

- `pnpm dev`: inicia o servidor de desenvolvimento
- `pnpm build`: executa a checagem de tipos e gera a build de producao
- `pnpm build-only`: gera a build sem rodar `type-check`
- `pnpm preview`: abre a build localmente para validacao
- `pnpm type-check`: executa a checagem de tipos com `vue-tsc`
