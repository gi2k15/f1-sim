<template>
  <v-app>
    <AppMenu />
    <v-main>
      <HomePage />
    </v-main>
  </v-app>
</template>

<script setup>
import AppMenu from "./components/AppMenu.vue";
import HomePage from "./pages/Home.vue";
</script>
