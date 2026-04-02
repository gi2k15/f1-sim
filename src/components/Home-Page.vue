<template>
  <v-progress-linear
    v-if="isImporting"
    class="mb-10"
    color="green-darken-3"
    location="top"
    indeterminate
  ></v-progress-linear>
  <v-container class="py-8">
    <v-tooltip text="Erro ao importar os dados">
      <template v-slot:activator="{ props }">
        <v-icon
          v-if="!isImported"
          v-bind="props"
          icon="mdi-alert"
          color="error"
          class="mb-1"
        />
      </template>
    </v-tooltip>
    <v-row class="mb-6">
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title class="text-title-medium"
              >Configurações</v-expansion-panel-title
            >
            <v-expansion-panel-text>
              <v-row class="mt-4">
                <v-col cols="12" sm="6" md="4">
                  <v-number-input
                    v-model="raceCount"
                    :min="0"
                    control-variant="stacked"
                    label="Número de corridas"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-number-input
                    v-model="sprintCount"
                    :min="0"
                    control-variant="split"
                    label="Número de sprints"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
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
  </v-container>
  <v-container class="d-flex justify-center">
    <v-btn color="green-darken-3" size="x-large" block>Simular</v-btn>
  </v-container>
  <v-container>
    <v-row>
      <v-col v-for="d in driverInfo" :key="d" cols="12" sm="6" md="4">
        <driver-card
          :position="d.position"
          :name="d.name"
          :team="d.team"
          :points="d.points"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";

import DriverCard from "./DriverCard.vue";

const isImporting = ref(false);
const isImported = ref(true);
const raceCount = ref(0);
const sprintCount = ref(0);
const simulationCount = ref(10000);
const driverInfo = ref([]);

async function getDriversChampionship() {
  const driversUrl = "https://f1api.dev/api/current/drivers-championship";
  try {
    isImporting.value = true;
    const driversResponse = await fetch(driversUrl);
    if (!driversResponse.ok) {
      throw new Error(
        `Erro ao carregar os pilotos: ${driversResponse.statusText}`,
      );
    }
    const driversJSON = await driversResponse.json();
    const championship = driversJSON.drivers_championship;
    console.log(championship);
    return championship.map((d) => {
      return {
        position: d.position,
        name: `${d.driver.name} ${d.driver.surname}`,
        team: d.team.teamName,
        points: d.points,
      };
    });
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    isImporting.value = false;
  }
}

onMounted(async () => {
  const data = await getDriversChampionship();
  if (data !== false) {
    driverInfo.value = data;
    isImported.value = true;
    console.log(driverInfo.value);
  } else {
    isImported.value = false;
  }
});
</script>
