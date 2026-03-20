<template>
  <v-card>
    <v-container>
      <v-row>
        <v-col cols="1" class="pt-1 ml-4">
          <div class="text-display-large text-red-darken-3">1</div>
        </v-col>
        <v-col>
          <v-card-title> Ayrton Senna </v-card-title>
          <v-card-subtitle> McLaren </v-card-subtitle>
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
        class="text-label-medium font-weight-thin text-left text-md-center"
      >
        <v-col>Pontos: 500</v-col>
        <v-col>Diferença para o anterior: 10 </v-col>
        <v-col>Diferença para o líder: 100</v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  position: { type: [Number, String], required: true },
  name: { type: String, required: true },
  diffLeader: { type: [Number, String], default: 0 },
  diffPrev: { type: [Number, String], default: 0 },
  probability: { type: [Number, String], default: 0 },
  teamIcon: { type: String, default: "" },
  teamName: { type: String, default: "" },
  countryCode: { type: String, default: "" },
  countryName: { type: String, default: "" },
});

const points = defineModel({
  type: [Number, String],
  default: 0,
});

const formattedProbability = computed(() => {
  const p = Number(props.probability) || 0;
  return `${Math.max(0, Math.min(100, p))}%`;
});
</script>
