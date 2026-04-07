<template>
  <v-container class="pt-8" max-width="1000">
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">FAQ</h1>
        <p class="text-body-large text-medium-emphasis">
          Perguntas frequentes sobre como a simulação funciona e de onde vêm os
          dados.
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-expansion-panels variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>O que este projeto faz?</v-expansion-panel-title>
            <v-expansion-panel-text>
              Ele estima a chance de cada piloto ser campeão ao final da
              temporada atual, usando várias simulações (Monte Carlo) do restante
              do campeonato com base nos pontos atuais.
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>De onde vêm os dados?</v-expansion-panel-title>
            <v-expansion-panel-text>
              Ao abrir a página principal, o app busca:
              <ul class="pl-6 mt-2">
                <li>
                  A classificação atual de pilotos (pontos, posição, equipe).
                </li>
                <li>O último GP do ano, para calcular quantas etapas faltam.</li>
              </ul>
              Esses dados vêm da API pública <code>f1api.dev</code>.
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>O que significam as configurações?</v-expansion-panel-title>
            <v-expansion-panel-text>
              <ul class="pl-6">
                <li>
                  <strong>Número de corridas</strong>: quantas corridas ainda
                  serão simuladas.
                </li>
                <li>
                  <strong>Número de sprints</strong>: quantas sprints ainda
                  serão simuladas.
                </li>
                <li>
                  <strong>Número de simulações</strong>: quantas “temporadas
                  alternativas” serão executadas para estimar as chances. Quanto
                  maior, mais estável tende a ser o resultado, mas pode demorar
                  mais.
                </li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>Como a simulação calcula os resultados?</v-expansion-panel-title>
            <v-expansion-panel-text>
              Para cada simulação:
              <ol class="pl-6 mt-2">
                <li>
                  O app envia ao Web Worker a lista de pilotos (nome + pontos
                  atuais) e quantas etapas faltam.
                </li>
                <li>
                  Para cada corrida/sprint restante, o Worker embaralha
                  aleatoriamente a ordem dos pilotos e atribui pontos conforme a
                  tabela.
                </li>
                <li>
                  Ao final, o(s) piloto(s) com mais pontos contam como campeão
                  daquela simulação (empates contam para todos os empatados).
                </li>
              </ol>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>Quais tabelas de pontos são usadas?</v-expansion-panel-title>
            <v-expansion-panel-text>
              Atualmente as pontuações são fixas no Worker:
              <ul class="pl-6 mt-2">
                <li>
                  <strong>Corrida</strong>: 25, 18, 15, 12, 10, 8, 6, 4, 2, 1
                </li>
                <li><strong>Sprint</strong>: 8, 7, 6, 5, 4, 3, 2, 1</li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>Por que a simulação roda em um Worker?</v-expansion-panel-title>
            <v-expansion-panel-text>
              Porque executar milhares de simulações pode ser pesado. O Web
              Worker roda em uma thread separada, evitando travar a UI enquanto
              as chances são calculadas.
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>O resultado é “preciso”?</v-expansion-panel-title>
            <v-expansion-panel-text>
              É uma estimativa simples, baseada apenas em aleatoriedade e nos
              pontos atuais. O modelo não considera ritmo, confiabilidade,
              penalidades, abandonos, grid, desempenho por pista, etc. Use como
              uma visualização divertida, não como previsão oficial.
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>Como interpretar a “chance (%)”?</v-expansion-panel-title>
            <v-expansion-panel-text>
              É a fração de simulações em que o piloto terminou como campeão,
              multiplicada por 100. Ex.: 23,50% significa que em ~23,5% das
              temporadas simuladas ele foi campeão (considerando o modelo atual).
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>Existe alternância de tema?</v-expansion-panel-title>
            <v-expansion-panel-text>
              Sim. O botão no topo alterna entre tema claro e escuro usando o
              sistema de temas do Vuetify.
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts"></script>
