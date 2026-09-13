# Quem leva a F1?

Simulador que estima a chance de cada piloto ser campeão ao final da temporada de Fórmula 1, além de acompanhar visualmente a evolução dessas probabilidades ao longo de cada etapa disputada do campeonato.

O projeto utiliza [simulações de Monte Carlo](https://pt.wikipedia.org/wiki/M%C3%A9todo_de_Monte_Carlo) executadas em segundo plano (via Web Workers) para rodar milhares de temporadas alternativas a partir da pontuação acumulada e calcular a probabilidade de título de cada piloto.

- [Quem leva a F1?](#quem-leva-a-f1)
  - [Funcionalidades](#funcionalidades)
  - [Como funciona](#como-funciona)
    - [1. Simulação Atual](#1-simulação-atual)
    - [2. Evolução do Campeonato](#2-evolução-do-campeonato)
    - [3. Edição Manual de Pontos](#3-edição-manual-de-pontos)
  - [De onde vêm os dados e Cache](#de-onde-vêm-os-dados-e-cache)
  - [Como interpretar a chance (%)](#como-interpretar-a-chance-)
  - [Limitações](#limitações)
  - [Stack](#stack)
  - [Como rodar](#como-rodar)
  - [Scripts](#scripts)
  - [Aviso legal](#aviso-legal)

---

## Funcionalidades

- **Simulação da Temporada Atual**: Cálculo em tempo real da probabilidade de título de cada piloto com base no número de GPs e Sprints restantes.
- **Gráfico de Evolução por Etapa**: Gráfico de linha interativo que traça as probabilidades de título rodada a rodada, desde o início do campeonato até a etapa mais recente.
- **Identidade Visual das Equipes**: Cores oficiais e contrastantes das 11 escuderias aplicadas nos nomes dos pilotos, chips de seleção, destaques da tabela e linhas do gráfico.
- **Filtros Rápidos**: Botões de seleção rápida (Top 3, Top 5, Top 10 e Todos) para facilitar a comparação visual no gráfico.
- **Tabela Comparativa de Evolução**: Tabela expansível com a probabilidade em cada etapa e a variação em relação à etapa imediatamente anterior.
- **Edição Manual de Pontuação**: Diálogo interativo para testar cenários hipotéticos ("e se fulano ganhasse a próxima corrida?") ou atualizar os pontos antes da homologação pela API.
- **Detecção Inteligente de Atualizações**: Alertas visuais indicando se a API já computou a última corrida disputada ou se os pontos ainda estão pendentes de atualização.
- **Otimização e Cache Local**: Cache inteligente via `localStorage` e dados consolidados offline para evitar chamadas de rede repetidas à API.

---

## Como funciona

### 1. Simulação Atual

Na aba principal **Simulação**:
- Configuração de corridas restantes, sprints restantes e número de iterações da simulação (padrão de 100.000 iterações).
- Grade responsiva com 3 cards de pilotos por linha em monitores grandes, exibindo posição, equipe, probabilidade atual com barra de progresso e diferenças para o líder e para o piloto à frente.

### 2. Evolução do Campeonato

Na aba **Evolução**:
- Simulação multi-etapas de Monte Carlo calculada para cada etapa já disputada, considerando os pontos acumulados naquela rodada específica e os eventos restantes à época.
- Gráfico interativo com legendas inteligentes, tooltips detalhados e escala percentual (0% a 100%).
- Indicador de variação percentual em relação à etapa anterior (▲ ganho de probabilidade / ▼ perda).

### 3. Edição Manual de Pontos

- Basta clicar no chip de pontuação de qualquer piloto para abrir o modal de edição.
- Permite adicionar pontuações pré-definidas da F1 (+25, +18, +15, etc.) ou digitar um valor customizado.
- Botão para restaurar a pontuação oficial da API a qualquer momento.

---

## De onde vêm os dados e Cache

Os dados da temporada são obtidos da API pública `f1api.dev`:
- Classificação oficial de pilotos, pontuações, equipes e posições.
- Dados das corridas e sprints do calendário oficial.

Para garantir performance instantânea e prevenir limites de taxa (*rate limits*):
- Os resultados e dados históricos são armazenados em cache no `localStorage` com controle de versão e expiração.
- O projeto inclui um *snapshot* consolidado das etapas iniciais da temporada para carregamento imediato sem requisições excessivas.

---

## Como interpretar a chance (%)

A probabilidade representa a porcentagem de temporadas simuladas em que determinado piloto terminou como campeão mundial. Em caso de empate em pontos ao término das corridas simuladas, aplica-se o critério oficial de desempate da Fórmula 1 (maior número de vitórias em GPs).

> **Exemplo**: `23,50%` significa que, no modelo probabilístico executado, o piloto foi campeão em aproximadamente 23.500 de cada 100.000 temporadas simuladas.

---

## Limitações

O modelo é probabilístico e focado em visualização e entretenimento. Não são considerados fatores complexos como:
- Desempenho e ritmo de corrida relativo dos carros
- Confiabilidade mecânica e quebras
- Punições de grid e desclassificações
- Condições meteorológicas e características específicas de cada circuito

Use as probabilidades como uma referência estatística divertida.

---

## Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **UI & Design**: [Vuetify 4](https://vuetifyjs.com/) & [Material Design Icons](https://materialdesignicons.com/)
- **Gráficos**: [Chart.js 4](https://www.chartjs.org/) & [vue-chartjs](https://vue-chartjs.org/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Processamento Assíncrono**: Web Workers dedicados para execução paralela de Monte Carlo sem travar a interface
- **Roteamento**: [Vue Router 5](https://router.vuejs.org/)
- **Gerenciador de Pacotes**: [pnpm](https://pnpm.io/)

---

## Como rodar

Clone o repositório e instale as dependências:

```bash
pnpm install
```

Inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

Abra seu navegador no endereço indicado (geralmente `http://localhost:3000`).

---

## Scripts

- `pnpm dev`: Inicia o servidor local de desenvolvimento
- `pnpm build`: Executa checagem de tipos estáticos (`vue-tsc`) e gera o pacote otimizado de produção
- `pnpm build-only`: Compila para produção sem verificação prévia de tipos
- `pnpm preview`: Servidor local para validar a build de produção gerada
- `pnpm type-check`: Roda a checagem de tipos estáticos do TypeScript

---

## Aviso legal

Este é um projeto independente, sem fins lucrativos, não oficial e sem afiliação, endosso ou patrocínio da Formula One Management, Formula One Licensing B.V., FIA, escuderias, pilotos ou demais entidades vinculadas ao Campeonato Mundial de Fórmula 1.

Fórmula 1, F1, nomes de Grandes Prêmios, escuderias, pilotos, marcas e logotipos mencionados pertencem aos seus respectivos proprietários. Todos os direitos reservados.
