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
const sprintCount = ref(0);
const simulationCount = ref(10000);
const driverInfo = ref([]);
const racesRemaining = ref(0);
const sprintsRemaining = ref(0);

async function getDriversChampionship() {
  const urls = {
    drivers: "https://f1api.dev/api/current/drivers-championship",
    races: "https://f1api.dev/api/current/last/race",
    sprints: "https://f1api.dev/api/current/last/sprint/race",
  };
  try {
    isImporting.value = true;
    const [driversResponse, racesResponse, sprintsResponse] = await Promise.all(
      Object.values(urls).map((url) => fetch(url)),
    );
    if (!driversResponse.ok || !racesResponse.ok || !sprintsResponse.ok) {
      throw new Error("Erro ao buscar dados");
    }
    const [driversJSON, racesJSON, sprintsJSON] = await Promise.all([
      driversResponse.json(),
      racesResponse.json(),
      sprintsResponse.json(),
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
    console.log(driverInfo.value);
  } else {
    isImported.value = false;
  }
});
</script>
