<template>
  <v-card>
    <v-container>
      <v-row>
        <v-col cols="2" class="pt-1 ml-4">
          <div class="text-display-large text-red-darken-3">{{ position }}</div>
        </v-col>
        <v-col>
          <v-card-title> {{ name }} </v-card-title>
          <v-card-subtitle> {{ team }} </v-card-subtitle>
        </v-col>
        <v-col cols="3">
          <v-progress-circular
            model-value="20"
            class="h-100 w-100"
            width="7"
            color="orange"
            reveal
            rounded
          >
            20%
          </v-progress-circular>
        </v-col>
      </v-row>
      <v-row
        density="default"
        class="text-label-medium font-weight-small text-left text-md-center"
      >
        <v-col>Pontos: {{ points }}</v-col>
        <v-col>Diferença para o anterior: </v-col>
        <v-col>Diferença para o líder: 100</v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup>
import { computed } from "vue";

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

const formattedProbability = computed(() => {
  const p = Number(props.probability) || 0;
  return `${Math.max(0, Math.min(100, p))}%`;
});
</script>
