<script setup>
import { ref, computed } from 'vue'
import Home from './components/Home-page.vue'
import FAQ from './components/Faq-page.vue'

const routes = {
  '/': Home,
  '/faq': FAQ,
}

const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/']
})
</script>

<template>
  <div class="links">
    <a href="#/">Home</a>&nbsp;
    <a href="#/faq">FAQ</a>
    <component :is="currentView" />
  </div>
</template>

<style scoped>
.links {
  padding: 5px;
}
</style>
