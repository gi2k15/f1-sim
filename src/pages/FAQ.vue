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
            <v-expansion-panel-title
              >O que este projeto faz?</v-expansion-panel-title
            >
            <v-expansion-panel-text>
              Ele estima a chance de cada piloto ser campeão ao final da
              temporada atual, usando várias simulações (<a
                href="https://pt.wikipedia.org/wiki/M%C3%A9todo_de_Monte_Carlo"
                target="_blank"
                noreferrer
                noopener
                >Monte Carlo</a
              >) do restante do campeonato com base nos pontos atuais.
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title
              >De onde vêm os dados?</v-expansion-panel-title
            >
            <v-expansion-panel-text>
              Ao abrir a página principal, o app busca:
              <ul class="pl-6 mt-2">
                <li>
                  A classificação atual de pilotos (pontos, posição, equipe).
                </li>
                <li>
                  O último GP do ano, para calcular quantas etapas faltam.
                </li>
              </ul>
              Esses dados vêm da API pública <code>f1api.dev</code>. Ela pode
              levar alguns dias para atualizar as informações, então tenha isso
              em mente quando for fazer simulações em dias de corrida ou nos
              dias seguintes.
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title
              >O que significam as configurações?</v-expansion-panel-title
            >
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
            <v-expansion-panel-title
              >O resultado é “preciso”?</v-expansion-panel-title
            >
            <v-expansion-panel-text>
              É uma estimativa simples, baseada apenas em aleatoriedade e nos
              pontos atuais. O modelo não considera ritmo, confiabilidade,
              penalidades, abandonos, grid, desempenho por pista, etc. Use como
              uma visualização divertida, não como previsão oficial.
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title
              >Como interpretar a “chance (%)”?</v-expansion-panel-title
            >
            <v-expansion-panel-text>
              É a fração de simulações em que o piloto terminou como campeão,
              multiplicada por 100. Ex.: 23,50% significa que em ~23,5% das
              temporadas simuladas ele foi campeão (considerando o modelo
              atual).
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts"></script>
