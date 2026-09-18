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
              <v-col cols="12" md="6">
                <v-sheet
                  color="transparent"
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
                </v-sheet>
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
          <v-sheet color="transparent" class="text-body-2 mt-1">
            O líder <strong>{{ leaderDriver?.name }}</strong> já possui
            combinações matemáticas possíveis para ser coroado campeão mundial
            na próxima corrida. Consulte a aba
            <em>Calculadora do Piloto</em> para conferir os resultados
            necessários.
          </v-sheet>
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
                  <v-sheet color="transparent" class="d-flex align-center ga-2">
                    <v-icon icon="mdi-chart-timeline" color="green-darken-2" />
                    <span>Situação Matemática de Todos os Pilotos</span>
                  </v-sheet>

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
                      <v-sheet
                        color="transparent"
                        class="d-flex align-center ga-2"
                      >
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
                      </v-sheet>
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

      <!-- ABA 2: CALCULADORA DO PILOTO SELECIONADO -->
      <v-tabs-window-item value="calculator">
        <!-- Seletor do piloto em foco -->
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-card variant="outlined" rounded="lg">
              <v-card-text>
                <v-select
                  v-model="selectedDriverName"
                  :items="aliveDriverOptions"
                  item-title="title"
                  item-value="name"
                  label="Selecione o piloto para avaliar"
                  prepend-inner-icon="mdi-racing-helmet"
                  hide-details
                >
                  <template #selection>
                    <v-sheet
                      v-if="selectedContenderDriver"
                      color="transparent"
                      class="d-flex align-center ga-2"
                    >
                      <v-avatar
                        size="22"
                        :color="getDriverColor(selectedContenderDriver)"
                        class="text-caption text-white"
                      >
                        {{ (selectedContenderDriver.name || "").charAt(0) }}
                      </v-avatar>
                      <span class="font-weight-bold">
                        {{ selectedContenderDriver.position }}º -
                        {{ selectedContenderDriver.name }} ({{
                          selectedContenderDriver.points
                        }}
                        pts)
                      </span>
                    </v-sheet>
                    <span v-else>{{ selectedDriverName }}</span>
                  </template>
                </v-select>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Seletor do Rival direto (se o piloto em foco for o Líder) -->
          <v-col v-if="isSelectedLeader" cols="12" md="6">
            <v-card variant="outlined" rounded="lg">
              <v-card-text>
                <v-select
                  v-model="selectedRivalName"
                  :items="rivalOptions"
                  item-title="title"
                  item-value="name"
                  label="Rival de comparação direta"
                  prepend-inner-icon="mdi-sword-cross"
                  hide-details
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- CENÁRIOS QUANDO O PILOTO SELECIONADO É O LÍDER -->
        <template v-if="isSelectedLeader">
          <v-row class="mb-4">
            <!-- Card 1: Requisitos mínimos se o rival vencer tudo -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="lg" class="h-100">
                <v-card-item>
                  <v-card-title class="d-flex align-center ga-2 text-wrap">
                    <v-icon icon="mdi-shield-check" color="green-darken-2" />
                    <span
                      >Se
                      {{ selectedRivalDriver?.name || "o vice-líder" }} vencer
                      todas</span
                    >
                  </v-card-title>
                  <v-card-subtitle>
                    Cenário mais agressivo do rival principal
                  </v-card-subtitle>
                </v-card-item>

                <v-card-text class="pt-2">
                  <v-sheet color="transparent" class="mb-4">
                    <span class="text-caption text-medium-emphasis">
                      Pontuação máxima que o rival pode atingir:
                    </span>
                    <h3 class="text-h5 font-weight-bold text-amber-darken-3">
                      {{ selectedRivalDriver?.maxAchievable }} pts
                    </h3>
                  </v-sheet>

                  <v-divider class="mb-4" />

                  <v-list density="compact" class="bg-transparent pa-0">
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon icon="mdi-target" color="primary" />
                      </template>
                      <v-list-item-title class="font-weight-medium">
                        Pontos necessários pelo líder:
                      </v-list-item-title>
                      <v-list-item-subtitle
                        class="text-body-1 font-weight-bold text-high-emphasis"
                      >
                        {{ leaderAnalysis?.minPointsIfRivalWinsAll }} pontos
                        adicionais
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon icon="mdi-numeric-3-box" color="primary" />
                      </template>
                      <v-list-item-title class="font-weight-medium">
                        Posição média segura por GP:
                      </v-list-item-title>
                      <v-list-item-subtitle
                        class="text-body-1 font-weight-bold text-success"
                      >
                        {{ leaderAnalysis?.minSafePositionDesc }}
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          icon="mdi-star-circle-outline"
                          color="primary"
                        />
                      </template>
                      <v-list-item-title class="font-weight-medium">
                        Número Mágico do Título:
                      </v-list-item-title>
                      <v-list-item-subtitle
                        class="text-body-1 font-weight-bold text-high-emphasis"
                      >
                        {{ leaderAnalysis?.magicPointsNeeded }} pontos garantem
                        a taça
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Card 2: Match Point no Próximo GP -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="lg" class="h-100">
                <v-card-item>
                  <v-card-title class="d-flex align-center ga-2 text-wrap">
                    <v-icon icon="mdi-check-decagram" color="amber-darken-2" />
                    <span>Título Antecipado (Próxima Corrida)</span>
                  </v-card-title>
                  <v-card-subtitle>
                    Possibilidade de decidir o campeonato no próximo evento
                  </v-card-subtitle>
                </v-card-item>

                <v-card-text class="pt-2">
                  <template v-if="leaderAnalysis?.canClinchInNext">
                    <v-alert
                      type="success"
                      variant="tonal"
                      density="compact"
                      class="mb-3 text-caption"
                      rounded="lg"
                    >
                      O líder pode ser campeão já no próximo GP se preencher uma
                      das combinações abaixo:
                    </v-alert>

                    <v-table density="compact" class="bg-transparent">
                      <thead>
                        <tr>
                          <th>Se o Líder terminar em</th>
                          <th>O Rival precisa</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(
                            item, idx
                          ) in leaderAnalysis.nextGpClincherScenarios"
                          :key="idx"
                        >
                          <td class="font-weight-bold text-success">
                            {{ item.leaderPosition }}
                          </td>
                          <td class="text-error font-weight-medium">
                            {{ item.rivalCondition }}
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </template>

                  <template v-else>
                    <v-alert
                      type="info"
                      variant="tonal"
                      density="compact"
                      rounded="lg"
                      class="mb-3"
                    >
                      Ainda não é matematicamente possível selar o título no
                      próximo GP.
                    </v-alert>
                    <p class="text-body-2 text-medium-emphasis">
                      Vantagem atual:
                      <strong>{{ leaderAnalysis?.leadGap }} pontos</strong
                      >.<br />
                      Após o próximo GP, ainda restarão
                      <strong
                        >{{
                          leaderAnalysis?.pointsRemainingAfterNext
                        }}
                        pontos</strong
                      >
                      em jogo. O líder precisará abrir mais vantagem para gerar
                      um match point nas corridas seguintes.
                    </p>
                  </template>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>

        <!-- CENÁRIOS QUANDO O PILOTO SELECIONADO É UM RIVAL/DESAFIANTE -->
        <template v-else-if="selectedContenderDriver">
          <v-row class="mb-4">
            <!-- Card do Rival: O que ele precisa fazer -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="lg" class="h-100">
                <v-card-item>
                  <v-card-title class="d-flex align-center ga-2 text-wrap">
                    <v-icon icon="mdi-sword-cross" color="amber-darken-2" />
                    <span>Missão para {{ selectedContenderDriver.name }}</span>
                  </v-card-title>
                  <v-card-subtitle>
                    Déficit atual e matemática da virada
                  </v-card-subtitle>
                </v-card-item>

                <v-card-text class="pt-2">
                  <v-row class="mb-2">
                    <v-col cols="6">
                      <v-sheet color="transparent">
                        <span class="text-caption text-medium-emphasis"
                          >Diferença para o Líder:</span
                        >
                        <h4 class="text-h6 font-weight-bold text-error">
                          -{{ contenderAnalysis?.deficit }} pts
                        </h4>
                      </v-sheet>
                    </v-col>
                    <v-col cols="6">
                      <v-sheet color="transparent">
                        <span class="text-caption text-medium-emphasis"
                          >Teto Máximo Atingível:</span
                        >
                        <h4 class="text-h6 font-weight-bold text-primary">
                          {{ contenderAnalysis?.maxPossible }} pts
                        </h4>
                      </v-sheet>
                    </v-col>
                  </v-row>

                  <v-divider class="mb-4" />

                  <v-list density="compact" class="bg-transparent pa-0">
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon icon="mdi-trending-down" color="primary" />
                      </template>
                      <v-list-item-title class="font-weight-medium">
                        Média de pontos a descontar:
                      </v-list-item-title>
                      <v-list-item-subtitle
                        class="text-body-1 font-weight-bold text-high-emphasis"
                      >
                        {{ contenderAnalysis?.avgPointsToDiscount }} pts/GP a
                        mais que o líder
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon
                          icon="mdi-hand-back-right-off"
                          color="primary"
                        />
                      </template>
                      <v-list-item-title class="font-weight-medium">
                        Limite de pontuação do líder:
                      </v-list-item-title>
                      <v-list-item-subtitle
                        class="text-body-1 font-weight-bold text-high-emphasis"
                      >
                        Líder pode somar no máx.
                        {{ contenderAnalysis?.maxLeaderGainAllowed }} pts
                        adicionais
                      </v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon icon="mdi-car-brake-alert" color="error" />
                      </template>
                      <v-list-item-title class="font-weight-medium">
                        Equivalente em tropeços do líder:
                      </v-list-item-title>
                      <v-list-item-subtitle
                        class="text-body-1 font-weight-bold text-error"
                      >
                        Precisa de aprox.
                        {{
                          contenderAnalysis?.dnfEquivalentsNeeded
                        }}
                        abandonos/zeradas do líder (com vitórias do desafiante)
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Card de Autonomia do Desafiante -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="lg" class="h-100">
                <v-card-item>
                  <v-card-title class="d-flex align-center ga-2 text-wrap">
                    <v-icon
                      icon="mdi-account-check-outline"
                      color="green-darken-2"
                    />
                    <span>Autonomia no Campeonato</span>
                  </v-card-title>
                  <v-card-subtitle>
                    Controle do próprio destino
                  </v-card-subtitle>
                </v-card-item>

                <v-card-text class="pt-2">
                  <template
                    v-if="selectedContenderDriver.status === 'controls_destiny'"
                  >
                    <v-alert
                      type="success"
                      variant="tonal"
                      rounded="lg"
                      icon="mdi-check-circle"
                      class="mb-3"
                    >
                      <v-alert-title class="font-weight-bold">
                        Depende Apenas de Si!
                      </v-alert-title>
                      <v-sheet color="transparent" class="text-body-2 mt-1">
                        Se {{ selectedContenderDriver.name }} vencer todas as
                        corridas e sprints restantes, será campeão mundial
                        independentemente das posições em que o líder terminar
                        (mesmo que o líder seja 2º em todas).
                      </v-sheet>
                    </v-alert>
                  </template>

                  <template
                    v-else-if="
                      selectedContenderDriver.status === 'depends_on_others'
                    "
                  >
                    <v-alert
                      type="warning"
                      variant="tonal"
                      rounded="lg"
                      icon="mdi-alert-circle-outline"
                      class="mb-3"
                    >
                      <v-alert-title class="font-weight-bold">
                        Depende de Tropeços do Líder
                      </v-alert-title>
                      <v-sheet color="transparent" class="text-body-2 mt-1">
                        Mesmo que {{ selectedContenderDriver.name }} vença todas
                        as etapas restantes, o líder será campeão se for 2º
                        colocado em todas as provas. É necessário que o líder
                        fique fora do pódio ou abandone etapas.
                      </v-sheet>
                    </v-alert>

                    <v-card
                      variant="flat"
                      color="surface-variant"
                      class="pa-3"
                      rounded="lg"
                    >
                      <v-sheet color="transparent" class="text-body-2">
                        <strong
                          >Posição máxima média que o líder pode ter:</strong
                        ><br />
                        O líder não pode passar de uma média de
                        <strong
                          >{{ contenderAnalysis?.maxLeaderAvgPerRace }} pontos
                          por corrida</strong
                        >
                        para que {{ selectedContenderDriver.name }} consiga
                        ultrapassá-lo ao vencer todas as etapas.
                      </v-sheet>
                    </v-card>
                  </template>

                  <template v-else>
                    <v-alert
                      type="error"
                      variant="tonal"
                      rounded="lg"
                      icon="mdi-close-octagon"
                    >
                      Piloto matematicamente eliminado da disputa pelo título
                      mundial de 2026.
                    </v-alert>
                  </template>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-tabs-window-item>

      <!-- ABA 3: SIMULADOR ETAPA A ETAPA (INTERATIVO) -->
      <v-tabs-window-item value="simulator">
        <v-row class="mb-4">
          <v-col cols="12">
            <v-card variant="outlined" rounded="lg">
              <v-card-item>
                <v-card-title
                  class="d-flex align-center justify-space-between flex-wrap ga-2"
                >
                  <v-sheet color="transparent" class="d-flex align-center ga-2">
                    <v-icon icon="mdi-ray-start-arrow" color="green-darken-2" />
                    <span>Simulador Interativo de Etapas Restantes</span>
                  </v-sheet>

                  <!-- Botões de Preset Rápido -->
                  <v-sheet color="transparent" class="d-flex flex-wrap ga-2">
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
                  </v-sheet>
                </v-card-title>
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
                          <v-sheet
                            color="transparent"
                            class="text-caption text-uppercase"
                          >
                            Líder ({{ leaderDriver?.name }})
                          </v-sheet>
                          <h2 class="text-h4 font-weight-bold">
                            {{ simulatedLeaderTotalPoints }} pts
                          </h2>
                          <v-sheet color="transparent" class="text-caption">
                            Original: {{ leaderDriver?.points }} pts (+{{
                              simulatedLeaderTotalPoints -
                              (leaderDriver?.points || 0)
                            }}
                            sim.)
                          </v-sheet>
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
                          <v-sheet
                            color="transparent"
                            class="text-caption text-uppercase"
                          >
                            Rival ({{ selectedRivalDriver?.name }})
                          </v-sheet>
                          <h2 class="text-h4 font-weight-bold">
                            {{ simulatedRivalTotalPoints }} pts
                          </h2>
                          <v-sheet color="transparent" class="text-caption">
                            Original: {{ selectedRivalDriver?.points }} pts (+{{
                              simulatedRivalTotalPoints -
                              (selectedRivalDriver?.points || 0)
                            }}
                            sim.)
                          </v-sheet>
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
                      <span class="ml-2 text-caption">
                        (Vantagem de
                        {{
                          Math.abs(
                            simulatedLeaderTotalPoints -
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
                      <th style="min-width: 140px" class="align-top py-3">
                        <v-sheet color="transparent" class="font-weight-bold pt-2">
                          Etapa
                        </v-sheet>
                      </th>
                      <th style="min-width: 290px" class="py-2">
                        <v-sheet color="transparent" class="d-flex flex-column ga-1 w-100">
                          <span class="font-weight-bold text-truncate">
                            Posição do Líder ({{ leaderDriver?.name }})
                          </span>
                          <v-sheet color="transparent" class="d-flex align-center ga-2 w-100">
                            <v-checkbox-btn
                              v-model="allLeaderSelected"
                              :indeterminate="isLeaderIndeterminate"
                              density="compact"
                              hide-details
                              inline
                              class="stage-checkbox flex-grow-0 flex-shrink-0"
                              v-tooltip="'Selecionar / desselecionar todos do Líder'"
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
                        </v-sheet>
                      </th>
                      <th style="min-width: 290px" class="py-2">
                        <v-sheet color="transparent" class="d-flex flex-column ga-1 w-100">
                          <span class="font-weight-bold text-truncate">
                            Posição do Rival ({{ selectedRivalDriver?.name }})
                          </span>
                          <v-sheet color="transparent" class="d-flex align-center ga-2 w-100">
                            <v-checkbox-btn
                              v-model="allRivalSelected"
                              :indeterminate="isRivalIndeterminate"
                              density="compact"
                              hide-details
                              inline
                              class="stage-checkbox flex-grow-0 flex-shrink-0"
                              v-tooltip="'Selecionar / desselecionar todos do Rival'"
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
                        </v-sheet>
                      </th>
                      <th class="text-right align-top py-3" style="min-width: 110px">
                        <v-sheet color="transparent" class="font-weight-bold pt-2">
                          Saldo do GP
                        </v-sheet>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(stage, idx) in interactiveStages" :key="idx">
                      <td class="font-weight-medium">
                        <v-sheet
                          color="transparent"
                          class="d-flex align-center ga-1"
                        >
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
                        </v-sheet>
                      </td>
                      <td>
                        <v-sheet color="transparent" class="d-flex align-center ga-2 w-100">
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
                        <v-sheet color="transparent" class="d-flex align-center ga-2 w-100">
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
                          {{
                            calcStageGain(stage.leaderPos, stage.rivalPos)
                          }}
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
