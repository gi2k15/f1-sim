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

:root {
  --cor-links: rgb(64, 255, 47);
  --cor-botao: rgb(11, 131, 0);
  --cor-botao-hover: rgb(7, 87, 0);
  --borda: 1px solid white;
  --borda-radius: 5px;
  --margin-top-botton: 1em 0;
}

h1,
p {
  text-align: center;
}

a {
  color: var(--cor-links);
}

input {
  background-color: black;
  color: white;
  border-radius: var(--borda-radius);
  border: var(--borda);
  padding: 5px;
  box-sizing: border-box;
  width: 100%;
}

input:hover,
input:focus {
  outline: none;
  border-color: var(--cor-links);
}

hr {
  margin: var(--margin-top-botton);
}

.links {
  padding: 5px;
}
</style>
