<template>
  <v-app>
    <AppMenu @open-drawer="isOpened = !isOpened" />
    <NavBar v-model="isOpened" />
    <v-main>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </v-main>
    <FooterBar />
  </v-app>
</template>

<script setup>
import AppMenu from "@/components/AppMenu.vue";
import NavBar from "@/components/NavBar.vue";
import FooterBar from "@/components/Footer.vue";

const isOpened = defineModel({ type: Boolean, default: false });
</script>
