<template>
  <v-container class="pt-4">
    <!-- Cabeçalho -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card variant="flat" color="transparent">
          <v-row align="center" justify="space-between">
            <v-col cols="12" sm="8">
              <h1 class="text-h4 font-weight-bold d-flex align-center ga-2">
                <v-icon
                  icon="mdi-chart-timeline-variant-shimmer"
                  color="green-darken-2"
                />
                Evolução do Campeonato
              </h1>
              <p class="text-body-large text-medium-emphasis mt-1">
                Acompanhe a probabilidade de cada piloto conquistar o título
                mundial calculada a cada etapa disputada da temporada.
              </p>
            </v-col>
            <v-col cols="12" sm="4" class="text-sm-right">
              <v-btn
                variant="tonal"
                color="green-darken-2"
                prepend-icon="mdi-refresh"
                :loading="isLoading"
                @click="reloadData(true)"
              >
                Recalcular
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Barra de progresso e status de carregamento -->
    <v-row v-if="isLoading" class="mb-6">
      <v-col cols="12">
        <v-card variant="outlined" rounded="lg">
          <v-card-text>
            <v-sheet
              color="transparent"
              class="d-flex align-center justify-space-between mb-2 text-caption text-medium-emphasis"
            >
              <span>{{ loadingStatusText }}</span>
              <span>{{ loadingPercent }}%</span>
            </v-sheet>
            <v-progress-linear
              v-model="loadingPercent"
              color="green-darken-3"
              height="8"
              rounded
              striped
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Erro -->
    <v-row v-else-if="errorMessage" class="mb-6">
      <v-col cols="12">
        <v-alert
          type="error"
          variant="tonal"
          icon="mdi-alert-circle-outline"
          rounded="lg"
          closable
        >
          {{ errorMessage }}
          <template #append>
            <v-btn
              variant="text"
              color="error"
              prepend-icon="mdi-reload"
              @click="reloadData(true)"
            >
              Tentar novamente
            </v-btn>
          </template>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Conteúdo Principal -->
    <template v-else-if="simulatedStages.length > 0">
      <!-- Filtros e Seleção de Pilotos -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card variant="outlined" rounded="lg">
            <v-card-text class="py-3">
              <v-row align="center" justify="space-between">
                <v-col cols="12" md="5" class="py-1">
                  <v-sheet color="transparent" class="d-flex align-center ga-2">
                    <v-icon
                      icon="mdi-filter-variant"
                      size="small"
                      color="medium-emphasis"
                    />
                    <span class="text-caption font-weight-bold text-uppercase"
                      >Filtro Rápido:</span
                    >
                    <v-btn-toggle
                      v-model="filterMode"
                      density="compact"
                      color="green-darken-3"
                      variant="outlined"
                      mandatory
                      @update:model-value="onFilterModeChange"
                    >
                      <v-btn value="top3" size="small">Top 3</v-btn>
                      <v-btn value="top5" size="small">Top 5</v-btn>
                      <v-btn value="top10" size="small">Top 10</v-btn>
                      <v-btn value="all" size="small">Todos</v-btn>
                    </v-btn-toggle>
                  </v-sheet>
                </v-col>

                <v-col
                  cols="12"
                  md="7"
                  class="py-1 text-md-right text-caption text-medium-emphasis"
                >
                  <v-icon icon="mdi-information-outline" size="small" />
                  Clique nos pilotos abaixo para adicionar ou remover do gráfico
                  ({{ activeDrivers.length }} de {{ allDriverNames.length }}
                  selecionados)
                </v-col>
              </v-row>

              <v-divider class="my-3" />

              <!-- Chips de seleção individual de pilotos com as cores das escuderias -->
              <v-chip-group v-model="selectedIndices" multiple column>
                <v-chip
                  v-for="(driver, idx) in rankedDrivers"
                  :key="driver.name"
                  filter
                  :color="driverTeamColor(driver)"
                  :variant="
                    selectedIndices.includes(idx) ? 'tonal' : 'outlined'
                  "
                  size="small"
                  class="font-weight-medium ma-1"
                  :style="{
                    borderColor: driverTeamColor(driver),
                    borderWidth: selectedIndices.includes(idx)
                      ? '1.5px'
                      : '1px',
                    opacity: selectedIndices.includes(idx) ? 1 : 0.65,
                  }"
                >
                  <v-avatar
                    start
                    size="8"
                    :color="driverTeamColor(driver)"
                    class="mr-1"
                  />
                  <span>{{ driver.name }}</span>
                  <v-badge
                    inline
                    color="transparent"
                    :class="
                      selectedIndices.includes(idx)
                        ? 'text-caption font-weight-bold ml-1'
                        : 'text-caption text-medium-emphasis ml-1'
                    "
                    :content="`${driver.latestChance}%`"
                  />
                </v-chip>
              </v-chip-group>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Gráfico de Linhas -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card variant="outlined" rounded="lg" class="pa-4">
            <v-card-title
              class="d-flex align-center justify-space-between flex-wrap ga-2 px-2 pb-2"
            >
              <v-sheet color="transparent" class="d-flex align-center ga-2">
                <v-icon icon="mdi-chart-bell-curve" color="green-darken-2" />
                <span class="text-h6 font-weight-bold"
                  >Curva de Chances de Vitória</span
                >
              </v-sheet>
              <v-chip size="small" variant="tonal" color="green-darken-2">
                {{ simulatedStages.length - 1 }} etapas disputadas
              </v-chip>
            </v-card-title>

            <v-card-subtitle
              class="px-2 pb-4 text-caption text-medium-emphasis"
            >
              Passe o cursor sobre as etapas para visualizar a pontuação e
              probabilidade acumulada de cada piloto.
            </v-card-subtitle>

            <v-card-text class="pa-0">
              <ChampionshipLineChart
                :stages="simulatedStages"
                :selected-drivers="activeDrivers"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Tabela Resumida e Detalhes da Etapa -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-expansion-panels variant="accordion">
            <v-expansion-panel rounded="lg">
              <v-expansion-panel-title class="text-title-medium">
                <v-icon
                  icon="mdi-table-large"
                  class="mr-2"
                  color="green-darken-2"
                />
                Tabela Detalhada: Classificação e Chances na Última Etapa
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-table density="comfortable" hover>
                  <thead>
                    <tr>
                      <th class="text-left font-weight-bold">Pos</th>
                      <th class="text-left font-weight-bold">Piloto</th>
                      <th class="text-left font-weight-bold">Equipe</th>
                      <th class="text-right font-weight-bold">Pontos Atuais</th>
                      <th class="text-right font-weight-bold">
                        Chance Atual (%)
                      </th>
                      <th class="text-right font-weight-bold">
                        Evolução vs Etapa Anterior
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(driver, idx) in rankedDrivers"
                      :key="driver.name"
                      :class="{
                        'bg-surface-light': activeDrivers.includes(driver.name),
                      }"
                    >
                      <td class="font-weight-medium">{{ idx + 1 }}º</td>
                      <td
                        class="font-weight-bold"
                        :style="{ color: driverTeamColor(driver) }"
                      >
                        {{ driver.name }}
                      </td>
                      <td :style="{ color: driverTeamColor(driver) }">
                        {{ driver.team }}
                      </td>
                      <td class="text-right font-weight-medium">
                        {{ driver.points }}
                      </td>
                      <td
                        class="text-right font-weight-bold"
                        :style="{ color: driverTeamColor(driver) }"
                      >
                        {{ driver.latestChance }}%
                      </td>
                      <td class="text-right">
                        <v-chip
                          size="small"
                          :color="
                            driver.deltaChance > 0
                              ? 'success'
                              : driver.deltaChance < 0
                                ? 'error'
                                : 'default'
                          "
                          variant="flat"
                        >
                          <v-icon
                            size="x-small"
                            :icon="
                              driver.deltaChance > 0
                                ? 'mdi-arrow-up'
                                : driver.deltaChance < 0
                                  ? 'mdi-arrow-down'
                                  : 'mdi-minus'
                            "
                          />
                          {{ driver.deltaChance > 0 ? "+" : ""
                          }}{{ driver.deltaChance.toFixed(1) }}%
                        </v-chip>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useTheme } from "vuetify";
import ChampionshipLineChart, {
  type StageData,
} from "@/components/ChampionshipLineChart.vue";
import {
  fetchChampionshipHistory,
  type ChampionshipStage,
} from "@/services/championshipHistory";
import { getTeamColor } from "@/constants/teamColors";

const theme = useTheme();

const isLoading = ref(true);
const loadingPercent = ref(10);
const loadingStatusText = ref("Iniciando...");
const errorMessage = ref("");

const filterMode = ref<"top3" | "top5" | "top10" | "all">("top5");
const selectedIndices = ref<number[]>([]);
const simulatedStages = ref<StageData[]>([]);

let worker: Worker | null = null;

function driverTeamColor(driver: {
  name: string;
  team?: string;
  teamId?: string;
}): string {
  return getTeamColor(driver, theme.global.current.value.dark);
}

// Ranking dos pilotos baseado na última etapa simulada
const rankedDrivers = computed(() => {
  if (simulatedStages.value.length === 0) return [];
  const latestStage = simulatedStages.value[simulatedStages.value.length - 1];
  const previousStage =
    simulatedStages.value.length > 1
      ? simulatedStages.value[simulatedStages.value.length - 2]
      : simulatedStages.value[0];

  return latestStage.drivers
    .map((d) => {
      const latestChance =
        latestStage.chances.find((c) => c.name === d.name)?.chance ?? 0;
      const previousChance =
        previousStage?.chances.find((c) => c.name === d.name)?.chance ?? 0;

      return {
        name: d.name,
        team: d.team,
        teamId: d.teamId,
        points: d.points,
        latestChance,
        previousChance,
        deltaChance: Number((latestChance - previousChance).toFixed(2)),
      };
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.latestChance - a.latestChance;
    });
});

const allDriverNames = computed(() => rankedDrivers.value.map((d) => d.name));

// Pilotos ativos no gráfico com base nos chips selecionados
const activeDrivers = computed(() => {
  if (rankedDrivers.value.length === 0) return [];
  return selectedIndices.value
    .map((idx) => rankedDrivers.value[idx]?.name)
    .filter(Boolean);
});

function onFilterModeChange(val: "top3" | "top5" | "top10" | "all") {
  if (rankedDrivers.value.length === 0) return;
  const total = rankedDrivers.value.length;
  let count = 5;
  if (val === "top3") count = 3;
  else if (val === "top5") count = 5;
  else if (val === "top10") count = 10;
  else if (val === "all") count = total;

  selectedIndices.value = Array.from(
    { length: Math.min(count, total) },
    (_, i) => i,
  );
}

async function reloadData(forceRefresh = false) {
  if (forceRefresh) {
    localStorage.removeItem("f1_sim_championship_history_2026_v2");
    localStorage.removeItem("f1_sim_stages_simulated_cache_v2");
  }

  isLoading.value = true;
  errorMessage.value = "";
  loadingPercent.value = 15;
  loadingStatusText.value = "Obtendo dados das corridas...";

  try {
    // Verificar se já temos simulações salvas em cache
    if (!forceRefresh) {
      const cachedSim = localStorage.getItem(
        "f1_sim_stages_simulated_cache_v2",
      );
      if (cachedSim) {
        try {
          const parsed = JSON.parse(cachedSim);
          if (Array.isArray(parsed) && parsed.length > 0) {
            simulatedStages.value = parsed;
            onFilterModeChange(filterMode.value);
            isLoading.value = false;
            return;
          }
        } catch (e) {
          console.warn("Cache de simulação inválido:", e);
        }
      }
    }

    const stages: ChampionshipStage[] = await fetchChampionshipHistory(
      (step, pct) => {
        loadingStatusText.value = step;
        loadingPercent.value = Math.min(70, Math.floor(15 + pct * 0.5));
      },
    );

    loadingStatusText.value = "Executando simulação Monte Carlo por etapa...";
    loadingPercent.value = 75;

    // Executar simulações no Web Worker
    if (worker) {
      worker.terminate();
    }
    worker = new Worker(
      new URL("../workers/simulation.worker.js", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (e) => {
      const data = e.data;
      if (data.type === "stageProgress") {
        const progress = Math.floor(75 + (data.completed / data.total) * 23);
        loadingPercent.value = Math.min(98, progress);
        loadingStatusText.value = `Simulando etapa ${data.completed} de ${data.total} (${data.currentStage})...`;
      } else if (data.type === "multiStageComplete") {
        simulatedStages.value = data.stagesResult;
        loadingPercent.value = 100;
        loadingStatusText.value = "Pronto!";

        try {
          localStorage.setItem(
            "f1_sim_stages_simulated_cache_v2",
            JSON.stringify(data.stagesResult),
          );
        } catch (err) {
          console.warn("Falha ao salvar cache de simulação:", err);
        }

        onFilterModeChange(filterMode.value);
        isLoading.value = false;
      }
    };

    worker.onerror = (err) => {
      console.error(err);
      errorMessage.value = "Ocorreu um erro ao processar a simulação.";
      isLoading.value = false;
    };

    worker.postMessage({
      mode: "multiStage",
      stages,
      numSimulations: 10000,
    });
  } catch (err: any) {
    console.error(err);
    errorMessage.value =
      err?.message || "Falha ao carregar os dados do campeonato.";
    isLoading.value = false;
  }
}

onMounted(() => {
  reloadData(false);
});

onBeforeUnmount(() => {
  if (worker) {
    worker.terminate();
    worker = null;
  }
});
</script>
