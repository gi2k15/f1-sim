<template>
  <v-progress-linear
    v-show="isImporting"
    color="green-darken-3"
    location="top"
    indeterminate
  ></v-progress-linear>
  <v-container class="pt-8">
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
                    v-model="sprintsRemaining"
                    :min="0"
                    control-variant="stacked"
                    label="Número de sprints"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-number-input
                    v-model="numSimulations"
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
    <v-btn
      color="green-darken-3"
      size="x-large"
      block
      :loading="isSimulating"
      @click="simulate()"
      >Simular</v-btn
    >
  </v-container>
  <v-container v-if="isImporting">
    <v-row>
      <v-col v-for="n in 3" :key="n" cols="12" sm="6" lg="4">
        <v-skeleton-loader type="sentences, chip@3" height="180" />
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else>
    <v-row>
      <v-col v-for="d in driverInfo" :key="d" cols="12" sm="6" lg="4">
        <driver-card
          :position="d.position"
          :name="d.name"
          :team="d.team"
          :chance="d.chance"
          :points="d.points"
          :difLeader="d.difLeader"
          :difPrevious="d.difPrevious"
          :isSimulating
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

import DriverCard from "./DriverCard.vue";

const isImporting = ref(false);
const isImported = ref(true);
const isSimulating = ref(false);
const driverInfo = ref([]);
const racesRemaining = ref(22);
const numSimulations = ref(10000);
const sprintsRemaining = ref(5);
const simulationWorker = new Worker(
  new URL("../workers/simulation.worker.js", import.meta.url),
  { type: "module" },
);

function simulate() {
  if (isSimulating.value) return;

  isSimulating.value = true;

  simulationWorker.postMessage({
    driverInfo: driverInfo.value.map((driver) => ({
      name: driver.name,
      points: driver.points,
    })),
    racesRemaining: racesRemaining.value,
    sprintsRemaining: sprintsRemaining.value,
    numSimulations: numSimulations.value,
  });
}

async function getDriversChampionship() {
  const urls = {
    drivers: "https://f1api.dev/api/current/drivers-championship",
    races: "https://f1api.dev/api/current/last/race",
  };
  try {
    isImporting.value = true;
    const [driversResponse, racesResponse] = await Promise.all(
      Object.values(urls).map((url) => fetch(url)),
    );
    if (!driversResponse.ok || !racesResponse.ok) {
      throw new Error("Erro ao buscar dados");
    }
    const [driversJSON, racesJSON] = await Promise.all([
      driversResponse.json(),
      racesResponse.json(),
    ]);
    const championship = driversJSON.drivers_championship;
    const leaderPts = championship[0].points;
    const racesRemaining = racesJSON.total - racesJSON.races.round;
    const drivers = championship.map((d, i, a) => ({
      position: d.position,
      name: `${d.driver.name} ${d.driver.surname}`,
      team: d.team.teamName,
      points: d.points,
      difLeader: leaderPts - d.points,
      difPrevious: (i > 0 ? a[i - 1].points : d.points) - d.points,
    }));
    return { drivers, racesRemaining };
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    isImporting.value = false;
  }
}

onMounted(async () => {
  simulationWorker.onmessage = (event) => {
    const { chances } = event.data;

    driverInfo.value.forEach((driver) => {
      const chanceObj = chances.find((chance) => chance.name === driver.name);
      driver.chance = chanceObj ? chanceObj.chance : "0.00";
    });
    isSimulating.value = false;
  };

  simulationWorker.onerror = (error) => {
    console.error(error);
    isSimulating.value = false;
  };

  const data = await getDriversChampionship();
  if (data !== false) {
    driverInfo.value = data.drivers;
    racesRemaining.value = data.racesRemaining;
    isImported.value = true;
  } else {
    isImported.value = false;
  }
});

onBeforeUnmount(() => {
  simulationWorker.terminate();
});
</script>
