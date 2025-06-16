# Simulador de Campeonato F1 2025 (Monte Carlo)

Este projeto é um simulador de campeonato de Fórmula 1 utilizando o método de Monte Carlo para estimar as probabilidades de cada piloto ser campeão, baseado na pontuação atual e no número de corridas restantes.

## Funcionalidades
- Entrada de dados dos pilotos via JSON ou manualmente
- Simulação de corridas restantes com distribuição de pontos conforme regras da F1
- Simulação de milhares de campeonatos para estimar probabilidades
- Exibição de barra de progresso durante o processamento (usando `tqdm`)
- Resultados apresentados em formato de tabela

## Como usar
1. **Instale as dependências:**
   
   ```powershell
   pip install tqdm
   ```

2. **Execute o simulador:**
   
   ```powershell
   python f1.py
   ```

3. **Siga as instruções no terminal:**
   - Escolha o método de entrada dos pilotos (manual ou JSON)
   - Informe a pontuação atual de cada piloto
   - Informe o número de corridas restantes
   - Aguarde a simulação (barra de progresso será exibida)
   - Veja as probabilidades de cada piloto ser campeão

## Exemplo de entrada JSON
```json
[
  {"nome": "Piloto A", "pontuacao": 120},
  {"nome": "Piloto B", "pontuacao": 110},
  {"nome": "Piloto C", "pontuacao": 95}
]
```

## Sobre o método Monte Carlo
O método de Monte Carlo consiste em simular milhares de possíveis desfechos para o campeonato, considerando a aleatoriedade dos resultados das corridas. Assim, é possível estimar a chance de cada piloto ser campeão de acordo com a situação atual.

## Licença
Este projeto é livre para uso educacional e pessoal.
