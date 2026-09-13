<template>
  <v-navigation-drawer temporary floating>
    <v-list nav>
      <v-list-item
        prepend-icon="mdi-home"
        title="Início"
        to="/"
        :active="isHomeActive"
      />
      <v-list-item
        prepend-icon="mdi-chart-timeline-variant-shimmer"
        title="Evolução"
        to="/?tab=evolucao"
        :active="isEvolutionActive"
      />
      <v-list-item
        prepend-icon="mdi-frequently-asked-questions"
        title="FAQ"
        to="/faq"
      />
      <v-list-item
        prepend-icon="mdi-coffee"
        title="Me compre um café"
        to="/cafe"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const isHomeActive = computed(() => {
  return (
    route.path === "/" &&
    (!route.query.tab ||
      route.query.tab === "simulacao" ||
      route.query.tab === "simulation")
  );
});

const isEvolutionActive = computed(() => {
  return (
    route.path === "/" &&
    (route.query.tab === "evolucao" || route.query.tab === "evolution")
  );
});
</script>
