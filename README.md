## F1 Sim

Simulador de temporada de Fórmula 1

Este projeto permite importar uma lista de pilotos, editar pontuações, configurar corridas e sprints restantes, e simular milhares de temporadas para calcular as chances de cada piloto ser campeão.

## Funcionalidades
- Importação de pilotos via JSON
- Edição manual da pontuação dos pilotos
- Configuração do número de corridas e sprints restantes
- Definição do número de simulações
- Visualização da tabela de pilotos, pontuação, diferença e probabilidade de título
- Interface responsiva para desktop e mobile

## Como usar
1. Cole o JSON dos pilotos no campo de texto e clique em "Importar".
2. Edite as pontuações conforme necessário.
3. Ajuste o número de corridas, sprints e simulações.
4. Veja a tabela atualizada com as chances de cada piloto.

### Exemplo de JSON de pilotos
```json
[
	{ "nome": "Max Verstappen", "pontuacao": 200 },
	{ "nome": "Lewis Hamilton", "pontuacao": 180 },
	{ "nome": "Charles Leclerc", "pontuacao": 150 }
]
```

## Requisitos
- Node.js
- pnpm

## Instalação
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
