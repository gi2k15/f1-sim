<template>
  <v-container class="py-8">
    <v-row class="mb-4">
      <v-col cols="12">
        <p>Clique no botão abaixo para importar a pontuação atual.</p>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title class="text-title-medium"
              >Configurações</v-expansion-panel-title
            >
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-number-input
                    v-model="raceCount"
                    :min="0"
                    control-variant="split"
                    label="Número de corridas"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-number-input
                    v-model="sprintCount"
                    :min="0"
                    control-variant="split"
                    label="Número de sprints"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-number-input
                    v-model="simulationCount"
                    :min="1"
                    control-variant="split"
                    label="Número de simulações"
                  />
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="text-center">
        <v-btn color="green-darken-4" prepend-icon="mdi-import"
          >Importar pontuação</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";

const raceCount = ref(0);
const sprintCount = ref(0);
const simulationCount = ref(10000);
</script>
