<script setup>
import { useTheme } from "vuetify";

const theme = useTheme();
</script>

<template>
  <v-app-bar>
    <v-app-bar-nav-icon> </v-app-bar-nav-icon>
    <v-app-bar-title>Quem ganhará a Fórmula 1?</v-app-bar-title>
    <template v-slot:append>
      <v-btn
        :icon="
          theme.global.current.value.dark
            ? 'mdi-weather-sunny'
            : 'mdi-weather-night'
        "
        @click="theme.cycle()"
      ></v-btn>
      <v-btn icon="mdi-home" to="/" />
      <v-btn icon="mdi-frequently-asked-questions" to="/faq" />
    </template>
  </v-app-bar>
</template>
