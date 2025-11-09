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
    <a href="#/faq">FAQ</a>&nbsp;
    <a href="https://github.com/gi2k15/f1-sim" target="_blank" noreferrer noopener>GitHub</a>
    <component :is="currentView" />
  </div>
</template>

<style>
body {
  color: white;
  background-color: black;
  font-family: sans-serif;
}

.links {
  padding: 5px;
}
</style>
