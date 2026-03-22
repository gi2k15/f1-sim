<template>
  <v-container class="py-8">
    <v-progress-linear
      v-if="isImporting"
      class="mb-10"
      indeterminate
      color="green-darken-3"
    ></v-progress-linear>
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
                    control-variant="split"
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
  <v-container>
    <v-row>
      <v-col v-for="d in driverInfo" :key="d.name" cols="12" sm="6">
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
const isImported = ref(false);
const raceCount = ref(0);
const sprintCount = ref(0);
const simulationCount = ref(10000);
const driverInfo = ref([]);

async function getDriversChampionship() {
  try {
    isImporting.value = true;
    const [responseChampionship, responseDrivers] = await Promise.all([
      fetch(
        "https://api.openf1.org/v1/championship_drivers?session_key=latest",
      ),
      fetch("https://api.openf1.org/v1/drivers?session_key=latest"),
    ]);
    if (!responseChampionship.ok)
      throw new Error(
        `Error while loading championship: ${responseChampionship.statusText}`,
      );
    if (!responseDrivers.ok)
      throw new Error(
        `Error while loading drivers: ${responseDrivers.statusText}`,
      );
    const championship = await responseChampionship.json();
    const drivers = await responseDrivers.json();
    console.log(championship);
    console.log(drivers);
    const driverInfo = drivers.map((d) => {
      const driverChampionship = championship.find(
        (p) => p.driver_number === d.driver_number,
      );
      return {
        position: driverChampionship.position_current,
        name: d.full_name,
        team: d.team_name,
        points: driverChampionship?.points_current,
      };
    });
    return driverInfo.sort((a, b) => a.position - b.position);
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
  } else {
    isImported.value = false;
  }
});
</script>
