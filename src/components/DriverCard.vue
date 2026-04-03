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
        <v-progress-linear model-value="20" color="green-darken-3" rounded>
        </v-progress-linear>
      </v-row>
      <v-row class="ga-2 justify-space-evenly">
        <v-chip density="compact" size="small" base-color="green-accent-3">
          Pontos: {{ points }}
        </v-chip>
        <v-chip density="compact" size="small" base-color="yellow-accent-3">
          Dif. líder: 100
        </v-chip>
        <v-chip density="compact" size="small" base-color="red-accent-2">
          Dif. anter.: 100
        </v-chip>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup>
// import { computed } from "vue";

const props = defineProps({
  position: { type: [Number, String] },
  name: { type: String },
  team: { type: String },
  points: { type: [Number, String] },
});

// const props = defineProps({
//   position: { type: [Number, String], required: true },
//   name: { type: String, required: true },
//   diffLeader: { type: [Number, String], default: 0 },
//   diffPrev: { type: [Number, String], default: 0 },
//   probability: { type: [Number, String], default: 0 },
//   teamIcon: { type: String, default: "" },
//   teamName: { type: String, default: "" },
//   countryCode: { type: String, default: "" },
//   countryName: { type: String, default: "" },
// });

// const points = defineModel({
//   type: [Number, String],
//   default: 0,
// });

// const formattedProbability = computed(() => {
//   const p = Number(props.probability) || 0;
//   return `${Math.max(0, Math.min(100, p))}%`;
// });
</script>
