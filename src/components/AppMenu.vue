<template>
  <v-app-bar scroll-behavior="collapse">
    <v-app-bar-nav-icon @click="$emit('openDrawer')" />
    <v-app-bar-title>Quem leva a F1?</v-app-bar-title>
    <template v-slot:append>
      <v-btn
        :icon="
          theme.global.current.value.dark
            ? 'mdi-weather-sunny'
            : 'mdi-weather-night'
        "
        @click="theme.cycle()"
      ></v-btn>
    </template>
  </v-app-bar>
</template>

<script setup>
import { useTheme } from "vuetify";

const theme = useTheme();
</script>
