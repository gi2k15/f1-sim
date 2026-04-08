<template>
  <v-app>
    <AppMenu @open-drawer="isOpened = !isOpened" />
    <NavBar v-model="isOpened" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import AppMenu from "@/components/AppMenu.vue";
import NavBar from "./components/NavBar.vue";

const isOpened = defineModel({ type: Boolean, default: false});
</script>
