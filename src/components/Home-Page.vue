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
                    v-model="racesRemaining"
                    :min="0"
                    control-variant="stacked"
                    label="Número de corridas"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-number-input
                    v-model="sprintCount"
                    :min="0"
                    control-variant="stacked"
                    label="Número de sprints"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-number-input
                    v-model="simulationCount"
                    :min="1"
                    control-variant="stacked"
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
      <v-col v-for="d in driverInfo" :key="d" cols="12" sm="6" lg="4">
        <driver-card
          :position="d.position"
          :name="d.name"
          :team="d.team"
          :points="d.points"
          :difLeader="d.difLeader"
          :difPrevious="d.difPrevious"
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
const racesRemaining = ref(0);

async function getDriversChampionship() {
  const driversUrl = "https://f1api.dev/api/current/drivers-championship";
  const racesUrl = "https://f1api.dev/api/current/last/race";
  try {
    isImporting.value = true;
    const driversResponse = await fetch(driversUrl);
    const racesResponse = await fetch(racesUrl);
    if (!driversResponse.ok || !racesResponse.ok) {
      throw new Error(`Error: ${driversResponse.statusText}`);
    }
    const driversJSON = await driversResponse.json();
    const racesJSON = await racesResponse.json();
    const championship = driversJSON.drivers_championship;
    console.log(championship);
    const numRaces = racesJSON.total;
    const currentRace = racesJSON.races.round;
    const racesRemaining = numRaces - currentRace;
    const leaderPts = championship[0].points;
    const drivers = championship.map((d, i, a) => {
      const previousPts = i > 0 ? a[i - 1].points : d.points;
      const difLeader = leaderPts - d.points;
      const difPrevious = previousPts - d.points;
      return {
        position: d.position,
        name: `${d.driver.name} ${d.driver.surname}`,
        team: d.team.teamName,
        points: d.points,
        difLeader: difLeader,
        difPrevious: difPrevious,
      };
    });
    return { drivers, racesRemaining };
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
    driverInfo.value = data.drivers;
    racesRemaining.value = data.racesRemaining;
    isImported.value = true;
    console.log(driverInfo.value);
  } else {
    isImported.value = false;
  }
});
</script>
