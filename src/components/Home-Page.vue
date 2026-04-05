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
  <v-container>
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
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";

import DriverCard from "./DriverCard.vue";

const racePontuation = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const sprintPontuation = [8, 7, 6, 5, 4, 3, 2, 1];

const isImporting = ref(false);
const isImported = ref(true);
const isSimulating = ref(false);
const driverInfo = ref([]);
const racesRemaining = ref(22);
const numSimulations = ref(10000);
const sprintsRemaining = ref(5);

function simulateRace(drivers, type = "race") {
  let order = [...drivers];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  let result = {};
  const points = type === "race" ? racePontuation : sprintPontuation;
  order.forEach((d, i) => {
    result[d.name] = (result[d.name] || 0) + (points[i] ?? 0);
  });
  return result;
}

function simulateSeason(drivers, numRaces, numSprints) {
  let temp = drivers.map((d) => ({
    name: d.name,
    points: Number(d.points) || 0,
  }));
  for (let i = 0; i < numRaces; i++) {
    const points = simulateRace(temp);
    temp.forEach((d) => {
      const value = Number(points[d.name]);
      d.points += isNaN(value) ? 0 : value;
    });
  }
  for (let i = 0; i < numSprints; i++) {
    const points = simulateRace(temp, "sprint");
    temp.forEach((d) => {
      const value = Number(points[d.name]);
      d.points += isNaN(value) ? 0 : value;
    });
  }
  return temp;
}

let chances = [];
async function simulate() {
  if (isSimulating.value) return;
  isSimulating.value = true;
  await nextTick();
  try {
    let wins = {};
    for (let i = 0; i < numSimulations.value; i++) {
      const season = simulateSeason(
        driverInfo.value,
        racesRemaining.value,
        sprintsRemaining.value,
      );
      const max = Math.max(...season.map((d) => d.points));
      const champion = season.filter((d) => d.points === max);
      champion.forEach((d) => (wins[d.name] = (wins[d.name] || 0) + 1));
      chances = driverInfo.value.map((d) => ({
        name: d.name,
        chance: (((wins[d.name] || 0) / numSimulations.value) * 100).toFixed(2),
      }));
      driverInfo.value.forEach((d) => {
        const chanceObj = chances.find((c) => c.name === d.name);
        d.chance = chanceObj ? chanceObj.chance : "0.00";
      });
    }
    console.log(driverInfo.value);
  } finally {
    isSimulating.value = false;
  }
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
  const data = await getDriversChampionship();
  if (data !== false) {
    driverInfo.value = data.drivers;
    racesRemaining.value = data.racesRemaining;
    isImported.value = true;
  } else {
    isImported.value = false;
  }
  console.log("Importação", simulateRace(driverInfo.value));
});
</script>
