<template>
  <v-card>
    <v-container class="pl-4 pr-4">
      <v-row class="flex-nowrap align-center">
        <v-col class="flex-grow-1 min-w-0">
          <v-card-title class="pl-0"> {{ name }}</v-card-title>
          <v-card-subtitle class="pl-0"> {{ team }} </v-card-subtitle>
        </v-col>
        <v-col class="justify-end text-right">
          <div class="text-display-medium text-red-darken-3 pt-2">
            {{ position < 10 ? `0${position}` : position }}
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-progress-linear model-value="20" color="green-darken-3" rounded>
        </v-progress-linear>
      </v-row>
      <v-row class="text-label-medium font-weight-small">
        <v-col>Pontos: {{ points }}</v-col>
        <v-col
          >Diferença para o anterior: <br />
          200
        </v-col>
        <v-col>Diferença para o líder: <br />100</v-col>
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
