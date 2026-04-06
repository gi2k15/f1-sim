<template>
  <v-card>
    <v-container class="pl-4 pr-4">
      <v-row class="flex-nowrap align-center">
        <v-col class="text-truncate">
          <v-card-title class="pl-0"> {{ name }}</v-card-title>
          <v-card-subtitle class="pl-0 mt-n2"> {{ team }} </v-card-subtitle>
        </v-col>
        <v-col class="justify-end text-right" cols="auto">
          <div class="text-display-medium text-red-darken-3 pt-2">
            {{ position < 10 ? `0${position}` : position }}
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-progress-linear
          v-if="chance || isSimulating"
          height="20"
          color="green-darken-3"
          rounded
          :model-value="chance"
          :indeterminate="isSimulating"
          ><div v-show="!isSimulating">{{ chance }}%</div>
        </v-progress-linear>
      </v-row>
      <v-row class="ga-2 justify-space-evenly flex-nowrap">
        <v-chip density="compact" size="small" base-color="green-darken-1" variant="outlined">
          Pontos: {{ points }}
        </v-chip>
        <v-chip density="compact" size="small" base-color="yellow-darken-3" variant="outlined">
          Dif. líder: {{ difLeader }}
        </v-chip>
        <v-chip density="compact" size="small" base-color="purple-lighten-2" variant="outlined">
          Dif. anter.: {{ difPrevious }}
        </v-chip>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup>
const props = defineProps({
  position: { type: [Number, String] },
  name: { type: String },
  team: { type: String },
  points: { type: [Number, String] },
  chance: { type: [Number, String] },
  difLeader: { type: [Number, String] },
  difPrevious: { type: [Number, String] },
  isSimulating: { type: Boolean },
});
</script>
