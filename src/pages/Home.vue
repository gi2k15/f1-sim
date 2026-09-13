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
                    label="Corridas restantes"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-number-input
                    v-model="sprintsRemaining"
                    :min="0"
                    control-variant="stacked"
                    label="Sprints restantes"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-number-input
                    v-model="numSimulations"
                    :min="1"
                    control-variant="stacked"
                    label="Número de simulações"
                    :step="10000"
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
    <v-row class="mb-2">
      <v-col
        cols="12"
        class="d-flex align-center justify-center flex-wrap ga-2 text-caption text-medium-emphasis text-center"
      >
        <div class="d-flex align-center ga-1">
          <v-icon icon="mdi-flag-checkered" size="small" />
          <span>
            Última corrida:
            <strong class="text-high-emphasis">{{ lastOccurredRaceName || raceName }}</strong>
            <span v-if="lastOccurredRaceDate" class="text-medium-emphasis">
              ({{ formatDateBR(lastOccurredRaceDate) }})
            </span>
          </span>
        </div>
        <template
          v-if="
            lastScoredRaceName &&
            lastScoredRaceName !== (lastOccurredRaceName || raceName)
          "
        >
          <span class="text-disabled">•</span>
          <div class="d-flex align-center ga-1">
            <v-icon icon="mdi-counter" size="small" />
            <span>
              Pontuação até:
              <strong class="text-high-emphasis">{{ lastScoredRaceName }}</strong>
            </span>
          </div>
        </template>
      </v-col>

      <v-col v-if="hasEditedPoints" cols="12" class="pt-0">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          icon="mdi-pencil-box-outline"
          class="text-caption"
        >
          <div
            class="d-flex align-center justify-space-between w-100 flex-wrap ga-2"
          >
            <span>
              Pontuações personalizadas ativas. Clique em
              <strong>Simular</strong> para atualizar as probabilidades.
            </span>
            <v-btn
              size="small"
              variant="outlined"
              color="amber-lighten-2"
              prepend-icon="mdi-restore"
              @click="resetAllPoints"
            >
              Restaurar original
            </v-btn>
          </div>
        </v-alert>
      </v-col>

      <v-col
        v-if="apiPointsStatus === 'pending'"
        cols="12"
        class="pt-0"
      >
        <v-alert
          type="warning"
          variant="tonal"
          density="compact"
          icon="mdi-clock-alert-outline"
          class="text-caption"
        >
          <div>
            <strong>A pontuação da API ainda não foi atualizada para o resultado mais recente!</strong>
          </div>
          <div class="mt-1">
            O <strong>{{ lastOccurredRaceName || raceName }}</strong> já ocorreu, mas a classificação oficial na API ainda não computou essa etapa.
            A pontuação exibida abaixo corresponde ao <strong>{{ lastScoredRaceName }}</strong>.
            O número de corridas restantes já foi atualizado para <strong>{{ racesRemaining }}</strong><span v-if="sprintsRemaining > 0"> (e <strong>{{ sprintsRemaining }}</strong> sprint restante)</span>.
          </div>
        </v-alert>
      </v-col>

      <v-col
        v-else-if="apiPointsStatus === 'updated'"
        cols="12"
        class="pt-0"
      >
        <v-alert
          type="success"
          variant="tonal"
          density="compact"
          icon="mdi-check-decagram-outline"
          class="text-caption"
        >
          <strong>Pontuação da API atualizada!</strong> A classificação já inclui o resultado mais recente do <strong>{{ lastOccurredRaceName || raceName }}</strong>.
        </v-alert>
      </v-col>
    </v-row>
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
          :isEdited="isDriverEdited(d.name)"
          @edit-points="openEditPoints(d)"
        />
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="editDialog" max-width="420">
    <v-card v-if="editingDriver" rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between pb-2">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-trophy-variant" color="amber-darken-2" />
          <span class="text-h6">Editar Pontuação</span>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          density="compact"
          @click="editDialog = false"
        />
      </v-card-title>

      <v-card-subtitle class="pb-3 text-body-2">
        <span class="font-weight-bold text-high-emphasis">{{
          editingDriver.name
        }}</span>
        <span v-if="editingDriver.team" class="text-medium-emphasis">
          • {{ editingDriver.team }}</span
        >
      </v-card-subtitle>

      <v-divider />

      <v-card-text class="pt-4">
        <div
          class="text-caption text-medium-emphasis mb-2 d-flex justify-space-between align-center"
        >
          <span
            >Pontos atuais: <strong>{{ editingDriver.points }}</strong></span
          >
          <span v-if="originalPoints[editingDriver.name] !== undefined">
            Original: <strong>{{ originalPoints[editingDriver.name] }}</strong>
          </span>
        </div>

        <v-number-input
          v-model="editedPoints"
          :min="0"
          control-variant="stacked"
          label="Nova pontuação"
          autofocus
          @keydown.enter="saveDriverPoints"
        />

        <div class="d-flex flex-wrap ga-1 mt-2">
          <v-chip
            v-for="increment in [1, 5, 10, 12, 15, 18, 25]"
            :key="increment"
            size="small"
            variant="outlined"
            class="cursor-pointer"
            @click="
              editedPoints = Math.max(0, Number(editedPoints || 0) + increment)
            "
          >
            +{{ increment }}
          </v-chip>
        </div>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn
          v-if="
            originalPoints[editingDriver.name] !== undefined &&
            editedPoints !== originalPoints[editingDriver.name]
          "
          variant="text"
          color="warning"
          prepend-icon="mdi-restore"
          @click="resetDriverToOriginal"
          >Restaurar original</v-btn
        >
        <v-btn variant="text" color="error" @click="editDialog = false">
          Cancelar
        </v-btn>
        <v-btn
          color="green-darken-3"
          variant="flat"
          prepend-icon="mdi-check"
          @click="saveDriverPoints"
        >
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import DriverCard from "@/components/DriverCard.vue";
import { grandPrix2026, sprintRaces2026 } from "@/constants/races";

const isImporting = ref(false);
const isImported = ref(true);
const isSimulating = ref(false);
const driverInfo = ref([]);
const racesRemaining = ref(22);
const numSimulations = ref(100000);
const sprintsRemaining = ref(5);
const raceName = ref("");
const raceDate = ref("");
const lastOccurredRaceName = ref("");
const lastOccurredRaceDate = ref("");
const lastScoredRaceName = ref("");
const lastScoredRaceDate = ref("");
const apiPointsStatus = ref("ok");
const originalPoints = ref({});
const editDialog = ref(false);
const editingDriver = ref(null);
const editedPoints = ref(0);

const simulationWorker = new Worker(
  new URL("../workers/simulation.worker.js", import.meta.url),
  { type: "module" },
);

const hasEditedPoints = computed(() => {
  return driverInfo.value.some(
    (d) =>
      originalPoints.value[d.name] !== undefined &&
      Number(d.points) !== Number(originalPoints.value[d.name]),
  );
});

function isDriverEdited(name) {
  const orig = originalPoints.value[name];
  if (orig === undefined) return false;
  const current = driverInfo.value.find((d) => d.name === name);
  return current ? Number(current.points) !== Number(orig) : false;
}

function openEditPoints(driver) {
  editingDriver.value = driver;
  editedPoints.value = Number(driver.points) || 0;
  editDialog.value = true;
}

function recalculateStandings() {
  driverInfo.value.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return Number(a.position) - Number(b.position);
  });

  const leaderPts = driverInfo.value[0]?.points ?? 0;

  driverInfo.value.forEach((driver, idx) => {
    driver.position = idx + 1;
    driver.difLeader = leaderPts - driver.points;
    driver.difPrevious =
      idx > 0 ? driverInfo.value[idx - 1].points - driver.points : 0;
    driver.chance = undefined;
  });
}

function saveDriverPoints() {
  if (!editingDriver.value) return;

  const newPoints = Math.max(0, Math.floor(Number(editedPoints.value) || 0));
  const targetName = editingDriver.value.name;

  const target = driverInfo.value.find((d) => d.name === targetName);
  if (target) {
    target.points = newPoints;
    recalculateStandings();
  }

  editDialog.value = false;
}

function resetDriverToOriginal() {
  if (!editingDriver.value) return;
  const original = originalPoints.value[editingDriver.value.name];
  if (original !== undefined) {
    editedPoints.value = original;
  }
}

function resetAllPoints() {
  driverInfo.value.forEach((d) => {
    if (originalPoints.value[d.name] !== undefined) {
      d.points = originalPoints.value[d.name];
    }
  });
  recalculateStandings();
}

function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const parts = String(dateStr).split("T")[0].split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return String(dateStr);
}

function daysSince(dateStr) {
  if (!dateStr) return 999;
  const raceDate = new Date(`${String(dateStr).split("T")[0]}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - raceDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function parseRaceDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  if (timeStr) {
    const d = new Date(`${dateStr}T${timeStr}`);
    if (!isNaN(d.getTime())) return d;
  }
  const fallback = new Date(`${dateStr}T23:59:59Z`);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function hasRaceOccurred(race, now = new Date()) {
  if (!race) return false;
  if (race.winner !== null && race.winner !== undefined) return true;

  const raceStart = parseRaceDateTime(
    race.schedule?.race?.date,
    race.schedule?.race?.time,
  );
  if (!raceStart) return false;

  const bufferMs = race.schedule?.race?.time ? 135 * 60 * 1000 : 0;
  const estimatedRaceEnd = new Date(raceStart.getTime() + bufferMs);
  return now >= estimatedRaceEnd;
}

function hasSprintOccurred(race, now = new Date()) {
  if (!race?.schedule?.sprintRace?.date) return false;

  const sprintStart = parseRaceDateTime(
    race.schedule.sprintRace.date,
    race.schedule.sprintRace.time,
  );
  if (!sprintStart) return false;

  const bufferMs = race.schedule.sprintRace.time ? 75 * 60 * 1000 : 0;
  const estimatedSprintEnd = new Date(sprintStart.getTime() + bufferMs);
  return now >= estimatedSprintEnd;
}

function gpsRemainingFallback(dateList) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;

  return dateList.filter((d) => {
    if (d > today) return true;
    if (d === today) {
      return now.getUTCHours() < 16;
    }
    return false;
  }).length;
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
    lastRace: "https://f1api.dev/api/current/last",
    seasonSchedule: "https://f1api.dev/api/current",
  };
  try {
    isImporting.value = true;
    const [standingsRes, lastRaceRes, seasonRes] = await Promise.allSettled([
      fetch(URLS.standings),
      fetch(URLS.lastRace),
      fetch(URLS.seasonSchedule),
    ]);

    if (standingsRes.status !== "fulfilled" || !standingsRes.value.ok) {
      throw new Error("Erro ao buscar dados da classificação");
    }

    const standingsJSON = await standingsRes.value.json();
    const championship = standingsJSON?.drivers_championship;
    if (!Array.isArray(championship) || championship.length === 0) {
      throw new Error("Dados do campeonato de pilotos indisponíveis");
    }

    let lastRaceJSON = null;
    if (lastRaceRes.status === "fulfilled" && lastRaceRes.value.ok) {
      lastRaceJSON = await lastRaceRes.value.json();
    }

    let seasonJSON = null;
    if (seasonRes.status === "fulfilled" && seasonRes.value.ok) {
      seasonJSON = await seasonRes.value.json();
    }

    const leaderPts = Number(championship[0]?.points ?? 0);
    const fallbackRaceName = lastRaceJSON?.race?.[0]?.raceName ?? "sem nome";
    const fallbackRaceDate =
      lastRaceJSON?.race?.[0]?.schedule?.race?.date ?? "";

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

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    const allRaces = Array.isArray(seasonJSON?.races) ? seasonJSON.races : [];

    // Verifica se há corrida principal ou sprint da API hoje e se já ocorreu
    const todayApiRace =
      allRaces.find((r) => r.schedule?.race?.date === today) ||
      (lastRaceJSON?.race?.[0]?.schedule?.race?.date === today
        ? lastRaceJSON.race[0]
        : null);

    const todayRaceOccurred = todayApiRace
      ? hasRaceOccurred(todayApiRace, now)
      : now.getUTCHours() >= 16;

    const todayApiSprint =
      allRaces.find((r) => r.schedule?.sprintRace?.date === today) ||
      (lastRaceJSON?.race?.[0]?.schedule?.sprintRace?.date === today
        ? lastRaceJSON.race[0]
        : null);

    const todaySprintOccurred = todayApiSprint
      ? hasSprintOccurred(todayApiSprint, now)
      : now.getUTCHours() >= 16;

    // O calendário canônico do campeonato é definido por grandPrix2026 e sprintRaces2026
    const calculatedRacesRemaining = grandPrix2026.filter((d) => {
      if (d > today) return true;
      if (d === today) return !todayRaceOccurred;
      return false;
    }).length;

    const calculatedSprintsRemaining = sprintRaces2026.filter((d) => {
      if (d > today) return true;
      if (d === today) return !todaySprintOccurred;
      return false;
    }).length;

    let mostRecentOccurred = null;
    let lastScored = null;
    let isPointsUpdated = true;
    let status = "ok";

    if (allRaces.length > 0) {
      const occurred = allRaces.filter((r) => hasRaceOccurred(r, now));
      mostRecentOccurred = occurred[occurred.length - 1] || null;
      lastScored =
        allRaces
          .filter((r) => r.winner !== null && r.winner !== undefined)
          .pop() || null;
    } else if (lastRaceJSON?.race?.[0]) {
      const race = lastRaceJSON.race[0];
      if (hasRaceOccurred(race, now)) {
        mostRecentOccurred = race;
      }
      if (race.winner !== null && race.winner !== undefined) {
        lastScored = race;
      }
    }

    if (mostRecentOccurred) {
      const isLatestScored =
        lastScored && lastScored.round >= mostRecentOccurred.round;
      isPointsUpdated = !!isLatestScored;

      const days = daysSince(mostRecentOccurred.schedule?.race?.date);
      if (!isPointsUpdated) {
        status = "pending";
      } else if (days <= 4) {
        status = "updated";
      } else {
        status = "ok";
      }
    }

    return {
      drivers,
      raceName: fallbackRaceName,
      raceDate: fallbackRaceDate,
      racesRemaining: calculatedRacesRemaining,
      sprintsRemaining: calculatedSprintsRemaining,
      mostRecentOccurredRace: mostRecentOccurred,
      lastScoredRace: lastScored,
      apiPointsStatus: status,
      isApiPointsUpdated: isPointsUpdated,
    };
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    isImporting.value = false;
  }
}

onMounted(async () => {
  simulationWorker.onmessage = (event) => {
    const { chances = [], decimals = 2 } = event.data;
    const defaultChance = (0).toFixed(decimals);

    driverInfo.value.forEach((driver) => {
      const chanceObj = chances.find((chance) => chance.name === driver.name);
      driver.chance = chanceObj ? chanceObj.chance : defaultChance;
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
    originalPoints.value = Object.fromEntries(
      data.drivers.map((d) => [d.name, d.points]),
    );
    if (data.racesRemaining !== null) {
      racesRemaining.value = data.racesRemaining;
    }
    if (data.sprintsRemaining !== null) {
      sprintsRemaining.value = data.sprintsRemaining;
    }
    raceName.value = data.raceName;
    raceDate.value = data.raceDate;

    if (data.mostRecentOccurredRace) {
      lastOccurredRaceName.value = data.mostRecentOccurredRace.raceName;
      lastOccurredRaceDate.value =
        data.mostRecentOccurredRace.schedule?.race?.date || "";
    } else {
      lastOccurredRaceName.value = data.raceName;
      lastOccurredRaceDate.value = data.raceDate;
    }

    if (data.lastScoredRace) {
      lastScoredRaceName.value = data.lastScoredRace.raceName;
      lastScoredRaceDate.value =
        data.lastScoredRace.schedule?.race?.date || "";
    } else {
      lastScoredRaceName.value = data.raceName;
      lastScoredRaceDate.value = data.raceDate;
    }

    apiPointsStatus.value = data.apiPointsStatus;
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
