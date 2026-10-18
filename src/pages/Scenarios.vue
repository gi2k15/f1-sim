<template>
  <v-container class="pt-4 pb-0">
    <v-tabs
      :model-value="'scenarios'"
      color="green-darken-3"
      align-tabs="center"
      density="comfortable"
    >
      <v-tab value="simulation" to="/" prepend-icon="mdi-racing-helmet">
        Simulação
      </v-tab>
      <v-tab
        value="evolution"
        to="/?tab=evolucao"
        prepend-icon="mdi-chart-timeline-variant-shimmer"
      >
        Evolução
      </v-tab>
      <v-tab
        value="scenarios"
        to="/cenarios"
        prepend-icon="mdi-trophy-variant-outline"
      >
        Cenários
      </v-tab>
    </v-tabs>
  </v-container>

  <v-container class="pt-4 pb-12">
    <!-- Cabeçalho Principal -->
    <v-row class="mb-2">
      <v-col cols="12">
        <v-card variant="flat" color="transparent">
          <v-row align="center" justify="space-between">
            <v-col cols="12" md="8">
              <h1 class="text-h4 font-weight-bold d-flex align-center ga-2">
                <v-icon
                  icon="mdi-trophy-variant-outline"
                  color="amber-darken-2"
                />
                Cenários de Título
              </h1>
              <p class="text-body-large text-medium-emphasis mt-1">
                Avaliação matemática determinística das possibilidades de título
                mundial para a temporada 2026 da Fórmula 1.
              </p>
            </v-col>
            <v-col cols="12" md="4" class="text-md-right">
              <v-btn
                variant="tonal"
                color="green-darken-2"
                prepend-icon="mdi-refresh"
                @click="resetToDefaults"
              >
                Restaurar Padrão
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Barra de Configuração e Resumo Rápido -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card variant="outlined" rounded="lg">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="6" md="3">
                <v-number-input
                  v-model="racesRemaining"
                  :min="0"
                  :max="24"
                  control-variant="stacked"
                  label="Corridas restantes"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-number-input
                  v-model="sprintsRemaining"
                  :min="0"
                  :max="6"
                  control-variant="stacked"
                  label="Sprints restantes"
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
                class="d-flex flex-wrap align-center justify-start justify-md-end ga-2"
              >
                <v-chip color="primary" variant="tonal" size="default">
                  <v-icon icon="mdi-flag-checkered" start />
                  {{ maxPointsInDispute }} pts em disputa
                </v-chip>
                <v-chip color="success" variant="tonal" size="default">
                  <v-icon icon="mdi-account-check" start />
                  {{ championshipStatus.contendersCount }} com chances
                </v-chip>
                <v-chip
                  v-if="championshipStatus.eliminatedCount > 0"
                  color="grey"
                  variant="tonal"
                  size="default"
                >
                  <v-icon icon="mdi-close-circle-outline" start />
                  {{ championshipStatus.eliminatedCount }} eliminados
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Alerta de Match Point no próximo GP, se aplicável -->
    <v-row v-if="leaderAnalysis?.canClinchInNext" class="mb-4">
      <v-col cols="12">
        <v-alert
          type="success"
          variant="tonal"
          rounded="lg"
          icon="mdi-trophy"
          prominent
        >
          <v-alert-title class="font-weight-bold">
            Match Point do Título no Próximo GP!
          </v-alert-title>
          <p class="text-body-2 mt-1 mb-0">
            O líder <strong>{{ leaderDriver?.name }}</strong> já possui
            combinações matemáticas possíveis para ser coroado campeão mundial
            na próxima corrida. Consulte a aba
            <em>Calculadora do Piloto</em> para conferir os resultados
            necessários.
          </p>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Navegação em Abas -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-tabs
          v-model="activeTab"
          color="green-darken-3"
          density="comfortable"
          grow
        >
          <v-tab value="overview" prepend-icon="mdi-format-list-numbered">
            Raio-X da Disputa
          </v-tab>
          <v-tab value="calculator" prepend-icon="mdi-calculator-variant">
            Calculadora do Piloto
          </v-tab>
          <v-tab value="simulator" prepend-icon="mdi-ray-start-arrow">
            Simulador Etapa a Etapa
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <v-tabs-window v-model="activeTab">
      <!-- ABA 1: RAIO-X DA DISPUTA (TABELA E STATUS GERAL) -->
      <v-tabs-window-item value="overview">
        <v-row class="mb-4">
          <v-col cols="12">
            <v-card variant="outlined" rounded="lg">
              <v-card-item>
                <v-card-title
                  class="d-flex align-center justify-space-between flex-wrap ga-2"
                >
                  <span class="d-flex align-center ga-2">
                    <v-icon icon="mdi-chart-timeline" color="green-darken-2" />
                    <span>Situação Matemática de Todos os Pilotos</span>
                  </span>

                  <!-- Filtro rápido de status -->
                  <v-chip-group
                    v-model="statusFilter"
                    selected-class="text-green-darken-3 font-weight-bold"
                    mandatory
                  >
                    <v-chip value="all" size="small" variant="outlined">
                      Todos ({{ championshipStatus.drivers.length }})
                    </v-chip>
                    <v-chip value="alive" size="small" variant="outlined">
                      Vivos ({{ championshipStatus.contendersCount }})
                    </v-chip>
                    <v-chip value="eliminated" size="small" variant="outlined">
                      Eliminados ({{ championshipStatus.eliminatedCount }})
                    </v-chip>
                  </v-chip-group>
                </v-card-title>
              </v-card-item>

              <v-divider />

              <v-table hover density="comfortable">
                <thead>
                  <tr>
                    <th class="text-center" style="width: 60px">Pos.</th>
                    <th>Piloto</th>
                    <th>Equipe</th>
                    <th class="text-right">Pontos Atuais</th>
                    <th class="text-right">Pontos Máx.</th>
                    <th class="text-right">Dif. Líder</th>
                    <th class="text-center">Status Matemático</th>
                    <th class="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="driver in filteredDrivers"
                    :key="driver.name"
                    :class="{
                      'bg-surface-light': selectedDriverName === driver.name,
                    }"
                  >
                    <td class="text-center font-weight-bold">
                      <v-badge
                        v-if="driver.position === 1"
                        icon="mdi-crown"
                        color="amber-darken-2"
                        inline
                      />
                      <span v-else>{{ driver.position }}º</span>
                    </td>
                    <td>
                      <span class="d-flex align-center ga-2">
                        <v-avatar
                          size="24"
                          :color="getDriverColor(driver)"
                          class="text-caption font-weight-bold text-white"
                        >
                          {{ driver.name.charAt(0) }}
                        </v-avatar>
                        <span
                          class="font-weight-bold"
                          :style="{ color: getDriverColor(driver) }"
                        >
                          {{ driver.name }}
                        </span>
                      </span>
                    </td>
                    <td>
                      <span :style="{ color: getDriverColor(driver) }">
                        {{ driver.team }}
                      </span>
                    </td>
                    <td class="text-right font-weight-bold">
                      {{ driver.points }}
                    </td>
                    <td class="text-right text-medium-emphasis">
                      {{ driver.maxAchievable }}
                    </td>
                    <td class="text-right">
                      <span v-if="driver.position === 1" class="text-disabled"
                        >-</span
                      >
                      <span v-else class="font-weight-medium text-error">
                        -{{ driver.diffToLeader }}
                      </span>
                    </td>
                    <td class="text-center">
                      <v-chip
                        size="small"
                        :color="driver.statusColor"
                        variant="tonal"
                        class="font-weight-medium"
                      >
                        {{ driver.statusLabel }}
                      </v-chip>
                    </td>
                    <td class="text-center">
                      <v-btn
                        size="small"
                        variant="text"
                        color="green-darken-2"
                        prepend-icon="mdi-calculator"
                        @click="selectDriverAndGoToCalc(driver.name)"
                      >
                        Avaliar
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <!-- ABA 2: CALCULADORA DO PILOTO -->
      <v-tabs-window-item value="calculator">
        <!-- BARRA DE SELEÇÃO: PILOTO E RIVAL -->
        <v-card variant="tonal" rounded="xl" class="mb-5 pa-2 pa-sm-3">
          <v-row align="center">
            <v-col cols="12" :md="isSelectedLeader ? 6 : 12">
              <v-select
                v-model="selectedDriverName"
                :items="aliveDriverOptions"
                item-title="title"
                item-value="name"
                label="Escolha o piloto para analisar o caminho do título"
                prepend-inner-icon="mdi-racing-helmet"
                variant="solo-filled"
                density="comfortable"
                rounded="lg"
                hide-details
              >
                <template #selection>
                  <v-sheet
                    v-if="selectedContenderDriver"
                    class="d-flex align-center ga-2 bg-transparent"
                  >
                    <v-chip
                      size="x-small"
                      variant="flat"
                      :color="getDriverColor(selectedContenderDriver)"
                      class="font-weight-black"
                    >
                      P{{ selectedContenderDriver.position }}
                    </v-chip>
                    <span class="font-weight-bold text-body-1">
                      {{ selectedContenderDriver.name }}
                    </span>
                    <span class="text-caption text-medium-emphasis">
                      ({{ selectedContenderDriver.team }})
                    </span>
                  </v-sheet>
                  <span v-else class="font-weight-bold">{{ selectedDriverName }}</span>
                </template>
              </v-select>
            </v-col>

            <!-- Seletor do Rival direto (se o piloto em foco for o Líder) -->
            <v-col v-if="isSelectedLeader" cols="12" md="6">
              <v-select
                v-model="selectedRivalName"
                :items="rivalOptions"
                item-title="title"
                item-value="name"
                label="Rival de comparação direta (perseguidor imediato)"
                prepend-inner-icon="mdi-sword-cross"
                variant="solo-filled"
                density="comfortable"
                rounded="lg"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card>

        <!-- CARTÃO PRINCIPAL / HERO DO PILOTO COM SUPER DESTAQUE -->
        <v-card
          v-if="selectedContenderDriver"
          variant="elevated"
          elevation="2"
          rounded="xl"
          class="mb-5 calc-hero-card"
          :style="{
            borderLeft: '8px solid ' + getDriverColor(selectedContenderDriver),
          }"
        >
          <v-card-text class="pa-4 pa-sm-6">
            <v-row align="center" justify="space-between">
              <!-- IDENTIFICAÇÃO DO PILOTO E EQUIPE -->
              <v-col cols="12" md="7">
                <v-sheet class="d-flex align-center ga-3 bg-transparent mb-2">
                  <v-avatar
                    size="48"
                    rounded="lg"
                    :color="getDriverColor(selectedContenderDriver)"
                    class="font-weight-black text-h6 text-white"
                  >
                    P{{ selectedContenderDriver.position }}
                  </v-avatar>
                  <v-sheet class="bg-transparent">
                    <span class="calc-label text-medium-emphasis d-block">
                      Piloto em Análise • Campeonato Mundial F1
                    </span>
                    <span class="text-h4 text-sm-h3 font-weight-black text-high-emphasis d-block tracking-tight">
                      {{ selectedContenderDriver.name }}
                    </span>
                  </v-sheet>
                </v-sheet>

                <!-- CHIPS E TAGS DO PILOTO -->
                <v-sheet class="d-flex flex-wrap align-center ga-2 bg-transparent mt-3">
                  <v-chip
                    size="default"
                    variant="tonal"
                    :color="getDriverColor(selectedContenderDriver)"
                    prepend-icon="mdi-shield-car"
                    class="font-weight-bold"
                  >
                    {{ selectedContenderDriver.team }}
                  </v-chip>

                  <v-chip
                    :color="driverStatusInfo?.color"
                    variant="flat"
                    size="default"
                    :prepend-icon="driverStatusInfo?.icon"
                    class="font-weight-bold"
                  >
                    {{ driverStatusInfo?.badgeText }}
                  </v-chip>

                  <v-chip
                    v-if="isSelectedLeader"
                    color="amber-darken-3"
                    variant="tonal"
                    size="default"
                    prepend-icon="mdi-crown"
                    class="font-weight-bold"
                  >
                    Líder do Mundial
                  </v-chip>
                </v-sheet>
              </v-col>

              <!-- SUPER DESTAQUE DOS PONTOS ATUAIS -->
              <v-col cols="12" md="5" class="mt-4 mt-md-0">
                <v-card
                  variant="tonal"
                  :color="getDriverColor(selectedContenderDriver)"
                  rounded="xl"
                  class="pa-4 pa-sm-5 text-center text-md-end"
                >
                  <span class="calc-label text-medium-emphasis d-block mb-1">
                    Pontos Acumulados
                  </span>
                  <v-sheet class="d-flex align-baseline justify-center justify-md-end bg-transparent ga-1">
                    <span
                      class="calc-points-hero"
                      :style="{ color: getDriverColor(selectedContenderDriver) }"
                    >
                      {{ selectedContenderDriver.points }}
                    </span>
                    <span class="text-h5 font-weight-black text-medium-emphasis">PTS</span>
                  </v-sheet>

                  <!-- Barra de progresso para a pontuação máxima possível -->
                  <v-sheet class="bg-transparent mt-2">
                    <v-sheet class="d-flex justify-space-between text-caption text-medium-emphasis mb-1 bg-transparent">
                      <span>Progresso até teto máximo</span>
                      <span class="font-weight-bold text-high-emphasis">
                        {{ selectedContenderDriver.points }} / {{ selectedContenderDriver.maxAchievable }} pts
                      </span>
                    </v-sheet>
                    <v-progress-linear
                      :model-value="(selectedContenderDriver.points / selectedContenderDriver.maxAchievable) * 100"
                      :color="getDriverColor(selectedContenderDriver)"
                      height="8"
                      rounded
                    />
                  </v-sheet>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 4 CARTOES DE MÉTRICAS CHAVE COM NÚMEROS GIGANTES -->
        <v-row class="mb-5">
          <!-- CARD 1: VANTAGEM OU DISTÂNCIA -->
          <v-col cols="12" sm="6" lg="3">
            <v-card
              variant="tonal"
              :color="isSelectedLeader ? 'success' : 'error'"
              rounded="xl"
              class="pa-4 h-100 d-flex flex-column justify-space-between text-center calc-kpi-card"
            >
              <v-sheet class="bg-transparent">
                <v-sheet class="d-flex align-center justify-center ga-1 mb-2 bg-transparent">
                  <v-icon
                    :icon="isSelectedLeader ? 'mdi-shield-crown' : 'mdi-arrow-collapse-down'"
                    size="small"
                  />
                  <span class="calc-label font-weight-bold">
                    {{ isSelectedLeader ? 'Vantagem na Liderança' : 'Distância para o Líder' }}
                  </span>
                </v-sheet>
                <v-sheet class="d-flex align-baseline justify-center ga-1 bg-transparent my-1">
                  <span class="calc-kpi-val">
                    {{ isSelectedLeader ? `+${leaderAnalysis?.leadGap || 0}` : `-${contenderAnalysis?.deficit || 0}` }}
                  </span>
                  <span class="text-subtitle-1 font-weight-bold opacity-75">pts</span>
                </v-sheet>
              </v-sheet>
              <span class="text-caption text-medium-emphasis font-weight-medium">
                {{ isSelectedLeader ? `sobre ${selectedRivalDriver?.name || 'rival'}` : `atrás de ${leaderDriver?.name}` }}
              </span>
            </v-card>
          </v-col>

          <!-- CARD 2: NÚMERO DECISIVO (MÁGICO PARA LÍDER OU MÉDIA PARA DESAFIANTE) -->
          <v-col cols="12" sm="6" lg="3">
            <v-card
              variant="tonal"
              :color="isSelectedLeader ? 'amber-darken-3' : 'deep-orange'"
              rounded="xl"
              class="pa-4 h-100 d-flex flex-column justify-space-between text-center calc-kpi-card"
            >
              <v-sheet class="bg-transparent">
                <v-sheet class="d-flex align-center justify-center ga-1 mb-2 bg-transparent">
                  <v-icon
                    :icon="isSelectedLeader ? 'mdi-trophy-award' : 'mdi-trending-down'"
                    size="small"
                  />
                  <span class="calc-label font-weight-bold">
                    {{ isSelectedLeader ? 'Número Mágico do Título' : 'Desconto Necessário' }}
                  </span>
                </v-sheet>
                <v-sheet class="d-flex align-baseline justify-center ga-1 bg-transparent my-1">
                  <span class="calc-kpi-val">
                    {{ isSelectedLeader ? (leaderAnalysis?.magicPointsNeeded ?? 0) : `+${contenderAnalysis?.avgPointsToDiscount || 0}` }}
                  </span>
                  <span class="text-subtitle-1 font-weight-bold opacity-75">
                    {{ isSelectedLeader ? 'pts' : 'pts/GP' }}
                  </span>
                </v-sheet>
              </v-sheet>
              <span class="text-caption text-medium-emphasis font-weight-medium">
                {{ isSelectedLeader ? 'garantem a taça matematicamente' : 'ritmo médio a descontar do líder' }}
              </span>
            </v-card>
          </v-col>

          <!-- CARD 3: TETO MÁXIMO DE PONTUAÇÃO -->
          <v-col cols="12" sm="6" lg="3">
            <v-card
              variant="tonal"
              color="primary"
              rounded="xl"
              class="pa-4 h-100 d-flex flex-column justify-space-between text-center calc-kpi-card"
            >
              <v-sheet class="bg-transparent">
                <v-sheet class="d-flex align-center justify-center ga-1 mb-2 bg-transparent">
                  <v-icon icon="mdi-flag-checkered" size="small" />
                  <span class="calc-label font-weight-bold">Pontuação Máxima</span>
                </v-sheet>
                <v-sheet class="d-flex align-baseline justify-center ga-1 bg-transparent my-1">
                  <span class="calc-kpi-val">{{ selectedContenderDriver.maxAchievable }}</span>
                  <span class="text-subtitle-1 font-weight-bold opacity-75">pts</span>
                </v-sheet>
              </v-sheet>
              <span class="text-caption text-medium-emphasis font-weight-medium">
                se vencer 100% das etapas restantes
              </span>
            </v-card>
          </v-col>

          <!-- CARD 4: PONTOS RESTANTES EM DISPUTA -->
          <v-col cols="12" sm="6" lg="3">
            <v-card
              variant="tonal"
              color="info"
              rounded="xl"
              class="pa-4 h-100 d-flex flex-column justify-space-between text-center calc-kpi-card"
            >
              <v-sheet class="bg-transparent">
                <v-sheet class="d-flex align-center justify-center ga-1 mb-2 bg-transparent">
                  <v-icon icon="mdi-gauge" size="small" />
                  <span class="calc-label font-weight-bold">Pontos em Disputa</span>
                </v-sheet>
                <v-sheet class="d-flex align-baseline justify-center ga-1 bg-transparent my-1">
                  <span class="calc-kpi-val">{{ maxPointsInDispute }}</span>
                  <span class="text-subtitle-1 font-weight-bold opacity-75">pts</span>
                </v-sheet>
              </v-sheet>
              <span class="text-caption text-medium-emphasis font-weight-medium">
                {{ racesRemaining }} GPs + {{ sprintsRemaining }} Sprints
              </span>
            </v-card>
          </v-col>
        </v-row>

        <!-- VEREDITO CLARO EM LINGUAGEM NATURAL (DIAGNÓSTICO ESTRATÉGICO) -->
        <v-card
          v-if="driverStatusInfo"
          variant="outlined"
          rounded="xl"
          class="mb-5 pa-4"
          :style="{
            borderLeft: '6px solid var(--v-theme-' + (driverStatusInfo.color === 'grey' ? 'secondary' : driverStatusInfo.color) + ')',
          }"
        >
          <v-sheet class="d-flex align-start ga-3 bg-transparent">
            <v-avatar
              :color="driverStatusInfo.color === 'grey' ? 'secondary' : driverStatusInfo.color"
              variant="tonal"
              size="44"
              rounded="lg"
            >
              <v-icon :icon="driverStatusInfo.icon" size="26" />
            </v-avatar>
            <v-sheet class="bg-transparent flex-grow-1">
              <span class="calc-label text-medium-emphasis d-block mb-1">
                Diagnóstico Oficial do Campeonato
              </span>
              <span class="text-h6 font-weight-bold text-high-emphasis d-block mb-1">
                {{ driverStatusInfo.title }}
              </span>
              <p class="text-body-1 text-high-emphasis mb-0 leading-relaxed">
                {{ driverStatusInfo.summary }}
              </p>
            </v-sheet>
          </v-sheet>
        </v-card>

        <!-- DETALHAMENTO ESTRATÉGICO: QUANDO É O LÍDER -->
        <template v-if="isSelectedLeader">
          <v-row class="mb-5">
            <!-- Card 1: Margem de Segurança do Líder -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="xl" class="h-100 pa-2 pa-sm-3">
                <v-card-item
                  title="Margem de Segurança do Líder"
                  subtitle="O que é necessário contra o rival mais próximo"
                >
                  <template #prepend>
                    <v-avatar color="success" variant="tonal" size="40" rounded="lg">
                      <v-icon icon="mdi-shield-check" color="success" size="24" />
                    </v-avatar>
                  </template>
                </v-card-item>

                <v-card-text class="pt-2">
                  <v-row>
                    <!-- Bloco 1: Número Mágico -->
                    <v-col cols="12" sm="6">
                      <v-card variant="tonal" color="amber-darken-3" rounded="lg" class="pa-3 text-center h-100">
                        <span class="calc-label d-block text-medium-emphasis mb-1">
                          Número Mágico
                        </span>
                        <span class="calc-mini-val text-amber-darken-3 d-block">
                          {{ leaderAnalysis?.magicPointsNeeded }} pts
                        </span>
                        <span class="text-caption text-medium-emphasis d-block mt-1">
                          garantem o título sem depender de ninguém
                        </span>
                      </v-card>
                    </v-col>

                    <!-- Bloco 2: Posição Segura Média -->
                    <v-col cols="12" sm="6">
                      <v-card variant="tonal" color="success" rounded="lg" class="pa-3 text-center h-100">
                        <span class="calc-label d-block text-medium-emphasis mb-1">
                          Posição Média Segura
                        </span>
                        <span class="calc-mini-val text-success d-block">
                          {{ leaderAnalysis?.minSafePositionDesc }}
                        </span>
                        <span class="text-caption text-medium-emphasis d-block mt-1">
                          suficiente para assegurar o caneco
                        </span>
                      </v-card>
                    </v-col>
                  </v-row>

                  <!-- Bloco 3: Pior Cenário Rival -->
                  <v-sheet class="mt-3 pa-3 bg-surface-variant rounded-lg">
                    <v-sheet class="d-flex align-center ga-2 bg-transparent mb-1">
                      <v-icon icon="mdi-sword-cross" color="error" size="small" />
                      <span class="font-weight-bold text-caption text-high-emphasis">
                        Se {{ selectedRivalDriver?.name || "o rival" }} vencer 100% das provas:
                      </span>
                    </v-sheet>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      O rival atinge no máximo
                      <strong class="text-high-emphasis">{{ selectedRivalDriver?.maxAchievable }} pts</strong>.
                      Basta ao líder somar
                      <strong class="text-success">{{ leaderAnalysis?.minPointsIfRivalWinsAll }} pts</strong>
                      nas {{ racesRemaining }} etapas restantes.
                    </p>
                  </v-sheet>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Card 2: Decisão no Próximo GP (Match Point) -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="xl" class="h-100 pa-2 pa-sm-3">
                <v-card-item
                  title="Decisão Antecipada (Próximo GP)"
                  subtitle="Possibilidade matemática de fechar a conta na próxima corrida"
                >
                  <template #prepend>
                    <v-avatar color="amber-darken-2" variant="tonal" size="40" rounded="lg">
                      <v-icon icon="mdi-check-decagram" color="amber-darken-2" size="24" />
                    </v-avatar>
                  </template>
                </v-card-item>

                <v-card-text class="pt-2">
                  <template v-if="leaderAnalysis?.canClinchInNext">
                    <v-alert
                      type="success"
                      variant="tonal"
                      density="comfortable"
                      class="mb-3"
                      rounded="lg"
                    >
                      <span class="font-weight-bold">
                        🏆 MATCH POINT CONFIRMADO: O título pode ser sacramentado já na próxima corrida!
                      </span>
                    </v-alert>

                    <v-table density="compact" class="bg-transparent rounded-lg">
                      <thead>
                        <tr>
                          <th class="font-weight-bold">Se o Líder terminar em</th>
                          <th class="font-weight-bold">O Rival precisa terminar em</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(item, idx) in leaderAnalysis.nextGpClincherScenarios"
                          :key="idx"
                        >
                          <td>
                            <v-chip size="small" color="success" variant="flat" class="font-weight-bold">
                              {{ item.leaderPosition }}
                            </v-chip>
                          </td>
                          <td>
                            <v-chip size="small" color="error" variant="tonal" class="font-weight-bold">
                              {{ item.rivalCondition }}
                            </v-chip>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </template>

                  <template v-else>
                    <v-sheet
                      class="pa-4 text-center rounded-xl bg-surface-variant"
                    >
                      <v-icon
                        icon="mdi-clock-outline"
                        size="x-large"
                        color="medium-emphasis"
                        class="mb-2"
                      />
                      <span class="text-subtitle-1 font-weight-bold d-block mb-1">
                        Ainda sem match point no próximo GP
                      </span>
                      <p class="text-body-2 text-medium-emphasis mb-3">
                        A vantagem atual é de
                        <strong class="text-high-emphasis">{{ leaderAnalysis?.leadGap }} pontos</strong>.
                        Como restarão
                        <strong class="text-high-emphasis">{{ leaderAnalysis?.pointsRemainingAfterNext }} pontos</strong>
                        em disputa após a próxima etapa, a taça será decidida nos GPs seguintes.
                      </p>
                      <v-sheet class="d-flex justify-center ga-3 bg-transparent flex-wrap">
                        <v-chip size="small" variant="outlined" color="primary" class="font-weight-bold">
                          Vantagem: +{{ leaderAnalysis?.leadGap }} pts
                        </v-chip>
                        <v-chip size="small" variant="outlined" color="info" class="font-weight-bold">
                          Pós-GP: {{ leaderAnalysis?.pointsRemainingAfterNext }} pts em jogo
                        </v-chip>
                      </v-sheet>
                    </v-sheet>
                  </template>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>

        <!-- DETALHAMENTO ESTRATÉGICO: QUANDO É UM DESAFIANTE / RIVAL -->
        <template v-else-if="selectedContenderDriver">
          <v-row class="mb-5">
            <!-- Card 1: A Missão do Desafiante -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="xl" class="h-100 pa-2 pa-sm-3">
                <v-card-item
                  :title="`A Missão de ${selectedContenderDriver.name}`"
                  subtitle="O que o piloto precisa executar na pista"
                >
                  <template #prepend>
                    <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
                      <v-icon icon="mdi-bullseye-arrow" color="primary" size="24" />
                    </v-avatar>
                  </template>
                </v-card-item>

                <v-card-text class="pt-2">
                  <v-row>
                    <!-- Bloco 1: Ritmo de desconto -->
                    <v-col cols="12" sm="6">
                      <v-card variant="tonal" color="deep-orange" rounded="lg" class="pa-3 text-center h-100">
                        <span class="calc-label d-block text-medium-emphasis mb-1">
                          Desconto Obrigatório
                        </span>
                        <span class="calc-mini-val text-deep-orange d-block">
                          +{{ contenderAnalysis?.avgPointsToDiscount }} pts/GP
                        </span>
                        <span class="text-caption text-medium-emphasis d-block mt-1">
                          vantagem média necessária sobre o líder
                        </span>
                      </v-card>
                    </v-col>

                    <!-- Bloco 2: Teto com vitórias totais -->
                    <v-col cols="12" sm="6">
                      <v-card variant="tonal" color="amber-darken-3" rounded="lg" class="pa-3 text-center h-100">
                        <span class="calc-label d-block text-medium-emphasis mb-1">
                          Teto de Vitórias
                        </span>
                        <span class="calc-mini-val text-amber-darken-3 d-block">
                          {{ contenderAnalysis?.maxPossible }} pts
                        </span>
                        <span class="text-caption text-medium-emphasis d-block mt-1">
                          vencendo 100% de corridas e sprints
                        </span>
                      </v-card>
                    </v-col>
                  </v-row>

                  <!-- Bloco 3: Dependência de Tropeços -->
                  <v-sheet
                    class="mt-3 pa-3 rounded-lg"
                    :class="selectedContenderDriver.status === 'controls_destiny' ? 'bg-success-subtle' : 'bg-surface-variant'"
                  >
                    <v-sheet class="d-flex align-center ga-2 bg-transparent mb-1">
                      <v-icon
                        :icon="selectedContenderDriver.status === 'controls_destiny' ? 'mdi-check-decagram' : 'mdi-alert-circle'"
                        :color="selectedContenderDriver.status === 'controls_destiny' ? 'success' : 'warning'"
                        size="small"
                      />
                      <span class="font-weight-bold text-caption text-high-emphasis">
                        {{ selectedContenderDriver.status === 'controls_destiny' ? 'Destino nas Próprias Mãos' : 'Depende de Resultados do Líder' }}
                      </span>
                    </v-sheet>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      <template v-if="selectedContenderDriver.status === 'controls_destiny'">
                        <strong class="text-success">Não depende de ninguém!</strong> Se vencer todas as etapas restantes, assegura a taça mesmo se o líder chegar em 2º lugar em todas as provas.
                      </template>
                      <template v-else>
                        <strong class="text-warning">Necessita de tropeços:</strong> Além de vencer suas corridas, precisa que o líder pontue abaixo de sua média costumeira.
                      </template>
                    </p>
                  </v-sheet>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Card 2: O Limite Permitido ao Líder -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="xl" class="h-100 pa-2 pa-sm-3">
                <v-card-item
                  :title="`O Limite de ${leaderDriver?.name}`"
                  subtitle="Até onde o líder pode pontuar para haver virada histórica"
                >
                  <template #prepend>
                    <v-avatar color="warning" variant="tonal" size="40" rounded="lg">
                      <v-icon icon="mdi-car-brake-alert" color="warning" size="24" />
                    </v-avatar>
                  </template>
                </v-card-item>

                <v-card-text class="pt-2">
                  <v-row>
                    <!-- Bloco 1: Pontuação Máxima Permitida -->
                    <v-col cols="12" sm="6">
                      <v-card variant="tonal" color="error" rounded="lg" class="pa-3 text-center h-100">
                        <span class="calc-label d-block text-medium-emphasis mb-1">
                          Teto Permitido ao Líder
                        </span>
                        <span class="calc-mini-val text-error d-block">
                          {{ contenderAnalysis?.maxLeaderGainAllowed }} pts
                        </span>
                        <span class="text-caption text-medium-emphasis d-block mt-1">
                          máximo que o líder pode somar
                        </span>
                      </v-card>
                    </v-col>

                    <!-- Bloco 2: Média Máxima por GP -->
                    <v-col cols="12" sm="6">
                      <v-card variant="tonal" color="primary" rounded="lg" class="pa-3 text-center h-100">
                        <span class="calc-label d-block text-medium-emphasis mb-1">
                          Média Máxima do Líder
                        </span>
                        <span class="calc-mini-val text-primary d-block">
                          {{ contenderAnalysis?.maxLeaderAvgPerRace }} pts/GP
                        </span>
                        <span class="text-caption text-medium-emphasis d-block mt-1">
                          equivalente a 6º lugar ou pior
                        </span>
                      </v-card>
                    </v-col>
                  </v-row>

                  <!-- Bloco 3: Equivalente em Abandonos (DNFs) -->
                  <v-sheet class="mt-3 pa-3 bg-surface-variant rounded-lg">
                    <v-sheet class="d-flex align-center ga-2 bg-transparent mb-1">
                      <v-icon icon="mdi-car-off" color="amber-darken-3" size="small" />
                      <span class="font-weight-bold text-caption text-high-emphasis">
                        Equivalente em Abandonos (DNFs):
                      </span>
                    </v-sheet>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      Cerca de
                      <strong class="text-amber-darken-3">
                        {{ contenderAnalysis?.dnfEquivalentsNeeded }} abandono(s) do líder
                      </strong>
                      com vitórias do desafiante já bastariam para liquidar a desvantagem e virar o campeonato.
                    </p>
                  </v-sheet>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>

        <!-- CARTÃO DE TRANSIÇÃO PARA O SIMULADOR ETAPA A ETAPA -->
        <v-card variant="tonal" color="primary" rounded="xl" class="pa-4 pa-sm-5 mb-3">
          <v-sheet class="d-flex flex-column flex-sm-row align-sm-center justify-space-between ga-3 bg-transparent">
            <v-sheet class="d-flex align-center ga-3 bg-transparent">
              <v-avatar color="primary" variant="flat" size="48" rounded="lg">
                <v-icon icon="mdi-calculator-variant-outline" size="28" />
              </v-avatar>
              <v-sheet class="bg-transparent">
                <span class="text-subtitle-1 font-weight-bold text-high-emphasis d-block">
                  Quer testar resultados corrida a corrida?
                </span>
                <span class="text-body-2 text-medium-emphasis d-block">
                  Defina as posições de chegada em cada GP e Sprint e veja o campeão e a pontuação mudando em tempo real.
                </span>
              </v-sheet>
            </v-sheet>
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              prepend-icon="mdi-flag-checkered"
              class="font-weight-bold flex-shrink-0"
              @click="activeTab = 'simulator'"
            >
              Simulador Etapa a Etapa
            </v-btn>
          </v-sheet>
        </v-card>
      </v-tabs-window-item>

      <!-- ABA 3: SIMULADOR ETAPA A ETAPA (INTERATIVO) -->
      <v-tabs-window-item value="simulator">
        <v-row class="mb-4">
          <v-col cols="12">
            <v-card variant="outlined" rounded="lg">
              <v-card-item>
                <template #prepend>
                  <v-icon icon="mdi-ray-start-arrow" color="green-darken-2" />
                </template>
                <v-card-title>
                  Simulador Interativo de Etapas Restantes
                </v-card-title>
                <template #append>
                  <span class="d-flex flex-wrap ga-2">
                    <v-btn
                      size="small"
                      variant="tonal"
                      color="primary"
                      @click="applyPreset('rival_wins_all')"
                    >
                      Rival Vence Tudo
                    </v-btn>
                    <v-btn
                      size="small"
                      variant="tonal"
                      color="success"
                      @click="applyPreset('leader_podiums')"
                    >
                      Líder Sempre no Pódio
                    </v-btn>
                    <v-btn
                      size="small"
                      variant="tonal"
                      color="warning"
                      @click="applyPreset('leader_dnf_one')"
                    >
                      Líder Zera 1 GP
                    </v-btn>
                    <v-btn
                      size="small"
                      variant="text"
                      color="grey"
                      @click="clearSimulatedRaces"
                    >
                      Limpar
                    </v-btn>
                  </span>
                </template>
                <v-card-subtitle>
                  Escolha os resultados das etapas restantes para o líder e o
                  rival principal e veja em tempo real quem fatura o caneco!
                </v-card-subtitle>
              </v-card-item>

              <v-divider />

              <!-- Placar ao vivo da Simulação -->
              <v-card-text>
                <v-row class="mb-4">
                  <v-col cols="12" md="6">
                    <v-card
                      variant="flat"
                      :color="
                        simulatedChampion?.name === leaderDriver?.name
                          ? 'green-darken-4'
                          : 'surface-variant'
                      "
                      class="pa-4"
                      rounded="lg"
                    >
                      <v-row align="center" justify="space-between">
                        <v-col>
                          <p class="text-caption text-uppercase mb-1">
                            Líder ({{ leaderDriver?.name }})
                          </p>
                          <p class="text-h4 font-weight-bold mb-1">
                            {{ simulatedLeaderTotalPoints }} pts
                          </p>
                          <p class="text-caption text-medium-emphasis mb-0">
                            Original: {{ leaderDriver?.points }} pts (+{{
                              simulatedLeaderTotalPoints -
                              (leaderDriver?.points || 0)
                            }}
                            sim.)
                          </p>
                        </v-col>
                        <v-col cols="auto">
                          <v-icon
                            v-if="
                              simulatedChampion?.name === leaderDriver?.name
                            "
                            icon="mdi-trophy"
                            size="48"
                            color="amber-accent-2"
                          />
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-card
                      variant="flat"
                      :color="
                        simulatedChampion?.name === selectedRivalDriver?.name
                          ? 'green-darken-4'
                          : 'surface-variant'
                      "
                      class="pa-4"
                      rounded="lg"
                    >
                      <v-row align="center" justify="space-between">
                        <v-col>
                          <p class="text-caption text-uppercase mb-1">
                            Rival ({{ selectedRivalDriver?.name }})
                          </p>
                          <p class="text-h4 font-weight-bold mb-1">
                            {{ simulatedRivalTotalPoints }} pts
                          </p>
                          <p class="text-caption text-medium-emphasis mb-0">
                            Original: {{ selectedRivalDriver?.points }} pts (+{{
                              simulatedRivalTotalPoints -
                              (selectedRivalDriver?.points || 0)
                            }}
                            sim.)
                          </p>
                        </v-col>
                        <v-col cols="auto">
                          <v-icon
                            v-if="
                              simulatedChampion?.name ===
                              selectedRivalDriver?.name
                            "
                            icon="mdi-trophy"
                            size="48"
                            color="amber-accent-2"
                          />
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Vencedor Projetado -->
                <v-alert
                  :type="
                    simulatedChampion?.name === leaderDriver?.name
                      ? 'success'
                      : 'warning'
                  "
                  variant="tonal"
                  rounded="lg"
                  class="mb-6 font-weight-medium"
                >
                  <v-row align="center" justify="space-between">
                    <v-col>
                      Campeão Projetado no Cenário:
                      <strong class="text-h6 ml-2">{{
                        simulatedChampion?.name
                      }}</strong>
                      <span class="text-caption ml-2">
                        ({{
                          simulatedChampion?.name === leaderDriver?.name
                            ? simulatedLeaderTotalPoints
                            : simulatedRivalTotalPoints
                        }}
                        pts vs
                        {{
                          Math.min(
                            simulatedLeaderTotalPoints,
                            simulatedRivalTotalPoints,
                          )
                        }}
                        pts)
                      </span>
                    </v-col>
                  </v-row>
                </v-alert>

                <!-- Tabela de Etapas para Configurar Resultados -->
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th
                        style="min-width: 140px"
                        class="align-top py-3 font-weight-bold"
                      >
                        Etapa
                      </th>
                      <th style="min-width: 290px" class="py-2">
                        <span
                          class="font-weight-bold text-truncate d-block mb-1"
                        >
                          Posição do Líder ({{ leaderDriver?.name }})
                        </span>
                        <v-sheet
                          color="transparent"
                          class="d-flex align-center ga-2 w-100"
                        >
                          <v-checkbox-btn
                            v-model="allLeaderSelected"
                            :indeterminate="isLeaderIndeterminate"
                            density="compact"
                            hide-details
                            inline
                            class="stage-checkbox flex-grow-0 flex-shrink-0"
                            v-tooltip="
                              'Selecionar / desselecionar todos do Líder'
                            "
                          />
                          <v-select
                            v-model="bulkLeaderPos"
                            :items="positionSelectItems"
                            density="compact"
                            hide-details
                            variant="outlined"
                            placeholder="Definir marcados..."
                            class="stage-select flex-grow-1"
                            @update:model-value="onBulkLeaderChange"
                          />
                        </v-sheet>
                      </th>
                      <th style="min-width: 290px" class="py-2">
                        <span
                          class="font-weight-bold text-truncate d-block mb-1"
                        >
                          Posição do Rival ({{ selectedRivalDriver?.name }})
                        </span>
                        <v-sheet
                          color="transparent"
                          class="d-flex align-center ga-2 w-100"
                        >
                          <v-checkbox-btn
                            v-model="allRivalSelected"
                            :indeterminate="isRivalIndeterminate"
                            density="compact"
                            hide-details
                            inline
                            class="stage-checkbox flex-grow-0 flex-shrink-0"
                            v-tooltip="
                              'Selecionar / desselecionar todos do Rival'
                            "
                          />
                          <v-select
                            v-model="bulkRivalPos"
                            :items="positionSelectItems"
                            density="compact"
                            hide-details
                            variant="outlined"
                            placeholder="Definir marcados..."
                            class="stage-select flex-grow-1"
                            @update:model-value="onBulkRivalChange"
                          />
                        </v-sheet>
                      </th>
                      <th
                        class="text-right align-top py-3 font-weight-bold"
                        style="min-width: 110px"
                      >
                        Saldo do GP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(stage, idx) in interactiveStages" :key="idx">
                      <td class="font-weight-medium">
                        <span class="d-flex align-center ga-1">
                          <v-icon
                            :icon="
                              stage.isSprint
                                ? 'mdi-lightning-bolt'
                                : 'mdi-flag-checkered'
                            "
                            size="small"
                            :color="
                              stage.isSprint
                                ? 'amber-darken-2'
                                : 'green-darken-2'
                            "
                          />
                          <span>{{ stage.name }}</span>
                        </span>
                      </td>
                      <td>
                        <v-sheet
                          color="transparent"
                          class="d-flex align-center ga-2 w-100"
                        >
                          <v-checkbox-btn
                            v-model="stage.selectedLeader"
                            density="compact"
                            hide-details
                            inline
                            class="stage-checkbox flex-grow-0 flex-shrink-0"
                          />
                          <v-select
                            v-model="stage.leaderPos"
                            :items="positionSelectItems"
                            density="compact"
                            hide-details
                            variant="outlined"
                            class="stage-select flex-grow-1"
                          />
                        </v-sheet>
                      </td>
                      <td>
                        <v-sheet
                          color="transparent"
                          class="d-flex align-center ga-2 w-100"
                        >
                          <v-checkbox-btn
                            v-model="stage.selectedRival"
                            density="compact"
                            hide-details
                            inline
                            class="stage-checkbox flex-grow-0 flex-shrink-0"
                          />
                          <v-select
                            v-model="stage.rivalPos"
                            :items="positionSelectItems"
                            density="compact"
                            hide-details
                            variant="outlined"
                            class="stage-select flex-grow-1"
                          />
                        </v-sheet>
                      </td>
                      <td class="text-right font-weight-bold">
                        <span
                          :class="
                            calcStageGain(stage.leaderPos, stage.rivalPos) >= 0
                              ? 'text-success'
                              : 'text-error'
                          "
                        >
                          {{
                            calcStageGain(stage.leaderPos, stage.rivalPos) > 0
                              ? "+"
                              : ""
                          }}
                          {{ calcStageGain(stage.leaderPos, stage.rivalPos) }}
                          pts
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useTheme } from "vuetify";
import { getTeamColor } from "@/constants/teamColors";
import {
  RACE_POINTS,
  calculateChampionshipStatus,
  calculateContenderAnalysis,
  calculateLeaderAnalysis,
  getInitialChampionshipData,
  getMaxPointsRemaining,
  getRacePointsByPosition,
  getSprintPointsByPosition,
} from "@/services/titleScenarios";

const theme = useTheme();

// Dados base da temporada
// Dados base da temporada inicializados imediatamente
const initData = getInitialChampionshipData();
const racesRemaining = ref(initData.racesRemaining ?? 10);
const sprintsRemaining = ref(initData.sprintsRemaining ?? 1);
const rawDrivers = ref(initData.drivers || []);
const activeTab = ref("overview");
const statusFilter = ref("all");
const selectedDriverName = ref(rawDrivers.value[0]?.name || "");
const selectedRivalName = ref(rawDrivers.value[1]?.name || "");

// Itens para select de posições
const positionSelectItems = [
  { title: "1º lugar (25 pts)", value: 1 },
  { title: "2º lugar (18 pts)", value: 2 },
  { title: "3º lugar (15 pts)", value: 3 },
  { title: "4º lugar (12 pts)", value: 4 },
  { title: "5º lugar (10 pts)", value: 5 },
  { title: "6º lugar (8 pts)", value: 6 },
  { title: "7º lugar (6 pts)", value: 7 },
  { title: "8º lugar (4 pts)", value: 8 },
  { title: "9º lugar (2 pts)", value: 9 },
  { title: "10º lugar (1 pt)", value: 10 },
  { title: "Fora dos pontos (0 pts)", value: 11 },
  { title: "Abandono / DNF (0 pts)", value: 12 },
];

// Carregamento inicial e sincronização
onMounted(() => {
  if (!selectedDriverName.value && rawDrivers.value.length > 0) {
    selectedDriverName.value = rawDrivers.value[0]?.name || "";
  }
  if (!selectedRivalName.value && rawDrivers.value.length > 1) {
    selectedRivalName.value = rawDrivers.value[1]?.name || "";
  }
  initInteractiveStages();
});

// Reseta para padrões oficiais da base
function resetToDefaults() {
  const init = getInitialChampionshipData();
  racesRemaining.value = init.racesRemaining ?? 10;
  sprintsRemaining.value = init.sprintsRemaining ?? 1;
  initInteractiveStages();
}

function getDriverColor(driver) {
  const isDark = theme.global.current.value.dark;
  return getTeamColor(driver, isDark);
}

// Status geral calculado
const championshipStatus = computed(() => {
  return calculateChampionshipStatus(
    rawDrivers.value,
    racesRemaining.value,
    sprintsRemaining.value,
  );
});

const maxPointsInDispute = computed(() => {
  return getMaxPointsRemaining(racesRemaining.value, sprintsRemaining.value);
});

const leaderDriver = computed(() => {
  return championshipStatus.value.leader;
});

// Pilotos filtrados para a tabela do Raio-X
const filteredDrivers = computed(() => {
  const list = championshipStatus.value.drivers;
  if (statusFilter.value === "alive") {
    return list.filter((d) => d.status !== "eliminated");
  }
  if (statusFilter.value === "eliminated") {
    return list.filter((d) => d.status === "eliminated");
  }
  return list;
});

// Opções para o select de pilotos vivos
const aliveDriverOptions = computed(() => {
  return championshipStatus.value.drivers
    .filter((d) => d.status !== "eliminated")
    .map((d) => ({
      name: d.name,
      title: `${d.position}º - ${d.name} (${d.points} pts)`,
      driver: d,
    }));
});

// Opções de rivais disponíveis (não inclui o líder)
const rivalOptions = computed(() => {
  return championshipStatus.value.drivers
    .filter((d) => d.position > 1 && d.status !== "eliminated")
    .map((d) => ({
      name: d.name,
      title: `${d.position}º - ${d.name} (${d.points} pts - dif: -${d.diffToLeader})`,
    }));
});

// Piloto em foco
const isSelectedLeader = computed(() => {
  return selectedDriverName.value === leaderDriver.value?.name;
});

const selectedContenderDriver = computed(() => {
  return (
    championshipStatus.value.drivers.find(
      (d) => d.name === selectedDriverName.value,
    ) || null
  );
});

const selectedRivalDriver = computed(() => {
  if (isSelectedLeader.value) {
    return (
      championshipStatus.value.drivers.find(
        (d) => d.name === selectedRivalName.value,
      ) ||
      championshipStatus.value.drivers[1] ||
      null
    );
  }
  return leaderDriver.value;
});

// Análise minuciosa do líder
const leaderAnalysis = computed(() => {
  if (!leaderDriver.value) return null;
  return calculateLeaderAnalysis(
    leaderDriver.value,
    selectedRivalDriver.value,
    racesRemaining.value,
    sprintsRemaining.value,
    false,
  );
});

// Análise minuciosa de desafiante
const contenderAnalysis = computed(() => {
  if (!selectedContenderDriver.value || !leaderDriver.value) return null;
  return calculateContenderAnalysis(
    selectedContenderDriver.value,
    leaderDriver.value,
    racesRemaining.value,
    sprintsRemaining.value,
  );
});

// Diagnóstico amigável e legível do piloto em foco
const driverStatusInfo = computed(() => {
  if (!selectedContenderDriver.value) return null;
  const d = selectedContenderDriver.value;
  if (isSelectedLeader.value) {
    const magic = leaderAnalysis.value?.magicPointsNeeded ?? 0;
    const safePos =
      leaderAnalysis.value?.minSafePositionDesc ?? "Pódios frequentes";
    const rivalName = selectedRivalDriver.value?.name || "o vice-líder";
    return {
      title: "Líder do Campeonato",
      color: "primary",
      icon: "mdi-trophy",
      badgeText: "1º Lugar - Líder Atual",
      summary: `${d.name} tem o campeonato sob controle. Para selar o título mundial sem depender de ninguém, precisa de ${magic} pontos nas etapas restantes. Mesmo se ${rivalName} vencer todas as provas, basta uma média de ${safePos}.`,
    };
  }
  if (d.status === "controls_destiny") {
    return {
      title: "Depende Apenas de Si",
      color: "success",
      icon: "mdi-check-decagram",
      badgeText: `${d.position}º Lugar - Depende Apenas de Si`,
      summary: `${d.name} tem o destino nas mãos! Vencendo todas as ${racesRemaining.value} corridas e ${sprintsRemaining.value} sprints restantes, será campeão mundial independentemente das posições em que o líder terminar (mesmo que o líder seja 2º em todas).`,
    };
  }
  if (d.status === "depends_on_others") {
    const deficit = contenderAnalysis.value?.deficit ?? 0;
    const avgDisc = contenderAnalysis.value?.avgPointsToDiscount ?? 0;
    const maxLeader = contenderAnalysis.value?.maxLeaderGainAllowed ?? 0;
    const maxLeaderAvg = contenderAnalysis.value?.maxLeaderAvgPerRace ?? 0;
    const dnfs = contenderAnalysis.value?.dnfEquivalentsNeeded ?? 1;
    const leaderName = leaderDriver.value?.name || "o líder";
    return {
      title: "Depende de Tropeços do Líder",
      color: "warning",
      icon: "mdi-alert-circle-outline",
      badgeText: `${d.position}º Lugar - Depende de Tropeços`,
      summary: `${d.name} está ${deficit} pontos atrás de ${leaderName}. Para ser campeão, precisa tirar uma média de ${avgDisc} pts por GP. Se vencer todas as etapas restantes, ${leaderName} não pode somar mais de ${maxLeader} pontos (média máxima de ${maxLeaderAvg} pts/GP, ou sofrer cerca de ${dnfs} abandono/zerada).`,
    };
  }
  return {
    title: "Matematicamente Eliminado",
    color: "grey",
    icon: "mdi-close-circle-outline",
    badgeText: `${d.position}º Lugar - Fora da Disputa`,
    summary: `${d.name} não possui mais chances matemáticas de alcançar o líder nesta temporada.`,
  };
});

function selectDriverAndGoToCalc(driverName) {
  selectedDriverName.value = driverName;
  activeTab.value = "calculator";
}

// SIMULADOR ETAPA A ETAPA INTERATIVO
const interactiveStages = reactive([]);

function initInteractiveStages() {
  interactiveStages.length = 0;
  const count = Math.min(10, Math.max(1, racesRemaining.value));
  for (let i = 1; i <= count; i += 1) {
    interactiveStages.push({
      name: `GP ${i} de ${count}`,
      isSprint: false,
      leaderPos: 2,
      rivalPos: 1,
      selectedLeader: false,
      selectedRival: false,
    });
  }
}

watch(racesRemaining, () => {
  initInteractiveStages();
});

// Controles de seleção em lote (Header)
const bulkLeaderPos = ref(null);
const bulkRivalPos = ref(null);

const allLeaderSelected = computed({
  get() {
    return (
      interactiveStages.length > 0 &&
      interactiveStages.every((s) => s.selectedLeader)
    );
  },
  set(val) {
    interactiveStages.forEach((s) => {
      s.selectedLeader = !!val;
    });
  },
});

const isLeaderIndeterminate = computed(() => {
  const selectedCount = interactiveStages.filter(
    (s) => s.selectedLeader,
  ).length;
  return selectedCount > 0 && selectedCount < interactiveStages.length;
});

const allRivalSelected = computed({
  get() {
    return (
      interactiveStages.length > 0 &&
      interactiveStages.every((s) => s.selectedRival)
    );
  },
  set(val) {
    interactiveStages.forEach((s) => {
      s.selectedRival = !!val;
    });
  },
});

const isRivalIndeterminate = computed(() => {
  const selectedCount = interactiveStages.filter((s) => s.selectedRival).length;
  return selectedCount > 0 && selectedCount < interactiveStages.length;
});

function onBulkLeaderChange(newVal) {
  if (newVal === null || newVal === undefined) return;
  const hasSelected = interactiveStages.some((s) => s.selectedLeader);
  interactiveStages.forEach((stage) => {
    if (hasSelected ? stage.selectedLeader : true) {
      stage.leaderPos = newVal;
    }
  });
}

function onBulkRivalChange(newVal) {
  if (newVal === null || newVal === undefined) return;
  const hasSelected = interactiveStages.some((s) => s.selectedRival);
  interactiveStages.forEach((stage) => {
    if (hasSelected ? stage.selectedRival : true) {
      stage.rivalPos = newVal;
    }
  });
}

function calcStageGain(leaderPos, rivalPos) {
  const lPts = leaderPos <= 10 ? getRacePointsByPosition(leaderPos) : 0;
  const rPts = rivalPos <= 10 ? getRacePointsByPosition(rivalPos) : 0;
  return lPts - rPts;
}

const simulatedLeaderTotalPoints = computed(() => {
  const base = Number(leaderDriver.value?.points) || 0;
  const simGain = interactiveStages.reduce((acc, stage) => {
    return (
      acc +
      (stage.leaderPos <= 10 ? getRacePointsByPosition(stage.leaderPos) : 0)
    );
  }, 0);
  return base + simGain;
});

const simulatedRivalTotalPoints = computed(() => {
  const base = Number(selectedRivalDriver.value?.points) || 0;
  const simGain = interactiveStages.reduce((acc, stage) => {
    return (
      acc + (stage.rivalPos <= 10 ? getRacePointsByPosition(stage.rivalPos) : 0)
    );
  }, 0);
  return base + simGain;
});

const simulatedChampion = computed(() => {
  if (simulatedRivalTotalPoints.value > simulatedLeaderTotalPoints.value) {
    return selectedRivalDriver.value;
  }
  return leaderDriver.value;
});

function applyPreset(presetType) {
  if (presetType === "rival_wins_all") {
    interactiveStages.forEach((stage) => {
      stage.rivalPos = 1;
      stage.leaderPos = 2;
    });
  } else if (presetType === "leader_podiums") {
    interactiveStages.forEach((stage) => {
      stage.leaderPos = 2;
      stage.rivalPos = 3;
    });
  } else if (presetType === "leader_dnf_one") {
    interactiveStages.forEach((stage, idx) => {
      stage.rivalPos = 1;
      stage.leaderPos = idx === 0 ? 12 : 2; // DNF no 1º GP
    });
  }
}

function clearSimulatedRaces() {
  interactiveStages.forEach((stage) => {
    stage.leaderPos = 11;
    stage.rivalPos = 11;
    stage.selectedLeader = false;
    stage.selectedRival = false;
  });
  bulkLeaderPos.value = null;
  bulkRivalPos.value = null;
}
</script>

<style scoped>
/* Transições suaves */
.v-card {
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

/* Calculadora do Piloto - Estilos Impactantes */
.calc-hero-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.calc-points-hero {
  font-size: clamp(3rem, 6vw, 4.4rem);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.calc-kpi-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.calc-kpi-card:hover {
  transform: translateY(-2px);
}

.calc-kpi-val {
  font-size: clamp(1.9rem, 3.8vw, 2.7rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.calc-mini-val {
  font-size: 1.45rem;
  font-weight: 900;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.calc-label {
  text-transform: uppercase;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

:deep(.stage-checkbox) {
  flex: 0 0 auto !important;
  width: 28px !important;
  min-width: 28px !important;
  max-width: 28px !important;
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.stage-checkbox .v-selection-control__wrapper) {
  width: 28px !important;
  height: 28px !important;
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.stage-select) {
  flex: 1 1 0% !important;
  min-width: 0 !important;
  width: 100% !important;
}
</style>
