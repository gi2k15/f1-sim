## Simulador de Campeonato de F1

Uma ferramenta web para simular o restante da temporada de Fórmula 1 e calcular as probabilidades de cada piloto se tornar campeão.

## Principais Funcionalidades

- **Busca de Dados Automática**: Com um clique, importe a classificação atual dos pilotos diretamente da API [f1api.dev](https://f1api.dev/).
- **Cálculo Automático do Calendário**: O simulador determina automaticamente o número de corridas e sprints restantes na temporada de 2025.
- **Simulação por Monte Carlo**: Executa milhares de simulações da temporada para calcular as probabilidades de título de cada piloto com base em um modelo aleatório.
- **Simulação Configurável**: Permite ajustar manualmente a pontuação dos pilotos, o número de corridas e sprints restantes, e a quantidade de temporadas a serem simuladas.
- **Tabela de Resultados Detalhada**: Apresenta os resultados em uma tabela ordenada, incluindo nacionalidade, equipe, pontuação, diferença para o líder e a probabilidade de título.
- **Página de FAQ**: Uma seção dedicada para explicar a metodologia, as fontes de dados e as limitações do simulador.
- **Design Responsivo**: Interface otimizada para uma experiência de uso agradável tanto em desktops quanto em dispositivos móveis.

## Como Usar

1.  Abra o simulador.
2.  Clique em **"Importar dados online"** para carregar a classificação mais recente. A data e o local da última corrida também serão preenchidos.
3.  (Opcional) Edite manualmente a pontuação de qualquer piloto ou ajuste os parâmetros da simulação (corridas, sprints, número de simulações) na seção de configuração.
4.  Clique em **"Simular"** para iniciar o cálculo.
5.  Analise as probabilidades de título de cada piloto na tabela de resultados.

## Tecnologias Utilizadas

- **Vue.js 3** (Composition API)
- **Vite** como ambiente de desenvolvimento
- **CSS** puro para estilização
- **i18n-iso-countries** para mapeamento de nacionalidades
- **flag-icons** para exibir as bandeiras dos países

## Desenvolvimento Local

### Requisitos

- Node.js
- pnpm

### Instalação

Clone o repositório e instale as dependências:

```sh
pnpm install
```

## Execução
```sh
pnpm dev
```

## Estrutura do projeto
- `src/App.vue`: componente principal
- `src/components/`: componentes de página
- `public/`: arquivos estáticos

## Licença
MIT
