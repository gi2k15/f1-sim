<template>
  <v-progress-linear
    v-show="isImporting"
    color="green-darken-3"
    location="top"
    indeterminate
  ></v-progress-linear>
  <v-container class="pt-8 home-content-width">
    <v-icon
      v-if="!isImported"
      v-tooltip="'Erro ao importar os dados'"
      icon="mdi-alert"
      color="error"
      class="mb-1"
    />
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
  <v-container class="d-flex justify-center home-content-width">
    <v-btn
      color="green-darken-3"
      size="x-large"
      block
      :loading="isSimulating"
      @click="simulate()"
      >Simular</v-btn
    >
  </v-container>
  <v-container v-if="isImporting" class="home-content-width">
    <v-row>
      <v-col v-for="n in 2" :key="n" cols="12" sm="6">
        <v-skeleton-loader type="sentences, chip@3" height="180" />
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else class="home-content-width">
    <div class="text-center font-italic mb-6">
      Última corrida: {{ raceName }}
    </div>
    <v-row>
      <v-col v-for="d in driverInfo" :key="d.name" cols="12" sm="6">
        <driver-card
          :position="d.position"
          :name="d.name"
          :team="d.team"
          :teamId="d.teamId"
          :chance="d.chance"
          :points="d.points"
          :difLeader="d.difLeader"
          :difPrevious="d.difPrevious"
          :isSimulating="isSimulating"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

import DriverCard from "@/components/DriverCard.vue";

// Datas dos Grandes Prêmios (corridas principais)
const grandPrix2026 = [
  "2026-03-08", // Austrália
  "2026-03-15", // China
  "2026-03-29", // Japão
  "2026-04-12", // Bahrein
  "2026-04-19", // Arábia Saudita
  "2026-05-03", // Miami
  "2026-05-24", // Canadá
  "2026-06-07", // Mônaco
  "2026-06-14", // Barcelona-Catalunha
  "2026-06-28", // Áustria
  "2026-07-05", // Grã-Bretanha
  "2026-07-19", // Bélgica
  "2026-07-26", // Hungria
  "2026-08-23", // Países Baixos
  "2026-09-06", // Itália
  "2026-09-13", // Espanha (Madri)
  "2026-09-26", // Azerbaijão
  "2026-10-11", // Singapura
  "2026-10-25", // Estados Unidos (Austin)
  "2026-11-01", // México
  "2026-11-08", // Brasil
  "2026-11-21", // Las Vegas
  "2026-11-29", // Catar
  "2026-12-06", // Abu Dhabi
];

// Datas das corridas Sprint
const sprintRaces2026 = [
  "2026-03-14", // China
  "2026-05-02", // Miami
  "2026-05-23", // Canadá
  "2026-07-04", // Grã-Bretanha
  "2026-08-22", // Países Baixos
  "2026-10-10", // Singapura
];

const isImporting = ref(false);
const isImported = ref(true);
const isSimulating = ref(false);
const driverInfo = ref([]);
const racesRemaining = ref(22);
const numSimulations = ref(10000);
const sprintsRemaining = ref(5);
const raceName = ref("");
const simulationWorker = new Worker(
  new URL("../workers/simulation.worker.js", import.meta.url),
  { type: "module" },
);

function gpsRemaining(dateList) {
  const today = Temporal.Now.plainDateISO();
  const datesRemaining = dateList.filter((d) => {
    const raceDate = Temporal.PlainDate.from(d);
    const isDateEarlier = Temporal.PlainDate.compare(today, raceDate);
    return isDateEarlier === -1;
  });
  console.log(datesRemaining);
  return datesRemaining.length;
}

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
  const URLS = {
    standings: "https://f1api.dev/api/current/drivers-championship",
    season: "https://f1api.dev/api/current",
    lastRace: "https://f1api.dev/api/current/last",
  };
  try {
    isImporting.value = true;
    const [standingsResponse, seasonResponse, lastRaceResponse] =
      await Promise.all(Object.values(URLS).map((url) => fetch(url)));
    if (!standingsResponse.ok || !seasonResponse.ok || !lastRaceResponse.ok) {
      throw new Error("Erro ao buscar dados");
    }
    const [standingsJSON, seasonJSON, lastRaceJSON] = await Promise.all([
      standingsResponse.json(),
      seasonResponse.json(),
      lastRaceResponse.json(),
    ]);
    const championship = standingsJSON?.drivers_championship;
    if (!Array.isArray(championship) || championship.length === 0) {
      throw new Error("Dados do campeonato de pilotos indisponíveis");
    }
    const leaderPts = Number(championship[0]?.points ?? 0);
    const raceName = lastRaceJSON?.race[0]?.raceName ?? "sem nome";

    const drivers = championship.map((d, i, a) => {
      const points = Number(d?.points ?? 0);
      const previousPoints = Number(
        i > 0 ? a[i - 1]?.points : (d?.points ?? 0),
      );
      return {
        position: d.position,
        name: `${d?.driver?.name ?? ""} ${d?.driver?.surname ?? ""}`.trim(),
        team: d?.team?.teamName ?? "",
        teamId: d?.team?.teamId ?? "",
        points,
        difLeader: leaderPts - points,
        difPrevious: previousPoints - points,
      };
    });

    return { drivers, raceName };
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
    racesRemaining.value = gpsRemaining(grandPrix2026);
    sprintsRemaining.value = gpsRemaining(sprintRaces2026);
    raceName.value = data.raceName;
    isImported.value = true;
  } else {
    isImported.value = false;
  }
});

onBeforeUnmount(() => {
  simulationWorker.terminate();
});
</script>

<style scoped>
.home-content-width {
  max-width: 960px;
}
</style>
