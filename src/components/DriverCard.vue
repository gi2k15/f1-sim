<template>
  <v-card class="driver-card">
    <v-container class="pl-4 pr-4">
      <v-row class="flex-nowrap align-center">
        <v-col class="text-truncate">
          <v-card-title
            class="pl-0 font-weight-medium"
            :style="{ color: driverColor }"
          >
            <div>{{ name }}</div></v-card-title
          >
          <v-card-subtitle class="pl-0 mt-n2">
            {{ team }}
          </v-card-subtitle>
        </v-col>
        <v-col class="justify-end text-right" cols="auto">
          <div class="text-display-medium text-red-darken-3 pt-2">
            {{ position < 10 ? `0${position}` : position }}
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-progress-linear
          height="20"
          color="green-darken-3"
          rounded
          :model-value="chance"
          :indeterminate="isSimulating"
          ><div v-show="chance && !isSimulating">{{ chance }}%</div>
        </v-progress-linear>
      </v-row>
      <v-row class="ga-2 justify-space-between flex-nowrap">
        <v-chip
          base-color="green-darken-1"
          variant="tonal"
          class="font-weight-bold"
        >
          Pontos: {{ points }}
        </v-chip>
        <v-chip
          base-color="yellow-darken-3"
          variant="tonal"
          class="font-weight-bold"
        >
          Dif. líder: {{ difLeader }}
        </v-chip>
        <v-chip
          base-color="purple-lighten-2"
          variant="tonal"
          class="font-weight-bold"
        >
          Dif. anter.: {{ difPrevious }}
        </v-chip>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import { useTheme } from "vuetify";

const props = defineProps({
  position: { type: [Number, String] },
  name: { type: String },
  team: { type: String },
  teamId: { type: String },
  points: { type: [Number, String] },
  chance: { type: [Number, String] },
  difLeader: { type: [Number, String] },
  difPrevious: { type: [Number, String] },
  isSimulating: { type: Boolean },
});

const theme = useTheme();

const lightTeamColors = {
  mercedes: "#007C70",
  ferrari: "#D9002A",
  mclaren: "#B85C00",
  haas: "#5F666A",
  alpine: "#0077B6",
  red_bull: "#2454A6",
  rb: "#3F65D9",
  audi: "#D92B00",
  williams: "#1454B8",
  cadillac: "#66666B",
  aston_martin: "#13795B",
};

const darkTeamColors = {
  mercedes: "#42F5D7",
  ferrari: "rgb(255 54 84)",
  mclaren: "#FF9A3D",
  haas: "#F1F3F4",
  alpine: "#4CC8FF",
  red_bull: "#78A7FF",
  rb: "#94B4FF",
  audi: "#FF573D",
  williams: "#6EA2FF",
  cadillac: "#D0D0D4",
  aston_martin: "#45C49A",
};

const driverColor = computed(() => {
  const colors = theme.global.current.value.dark
    ? darkTeamColors
    : lightTeamColors;

  return colors[props.teamId] ?? "rgb(var(--v-theme-on-surface))";
});
</script>

<style scoped>
.driver-card:hover {
  outline: 2px solid #2e7d32;
}
</style>
