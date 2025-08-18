<script setup>
import { ref } from 'vue'

const tabelaPilotos = ref([])

function getJSON() {
  const textoJSON = document.getElementById('json-pilotos').value
  try {
    tabelaPilotos.value = JSON.parse(textoJSON).slice(0, 20)
  } catch (e) {
    alert("Erro: " + e.message)
  }
}
</script>

<template>
  <form class="form-json">
    <textarea id="json-pilotos" spellcheck="false"></textarea>
    <button @click.prevent="getJSON()">Importar</button>
  </form>
  <form>
    <div class="grid-pilotos">
      <div v-for="(p, i) in tabelaPilotos" :key="i" class="pilotos">
        <label>{{ p.nome }}</label>
        <input v-model.number="p.pontuacao" maxlength="3" />
      </div>
    </div>
    <div class="config">
      <div>
        <label>Corridas restantes</label>
        <input id="corridas-restantes" />
      </div>
      <div>
        <label>Corridas sprint restantes</label>
        <input id="corridas-sprint-restantes" />
      </div>
      <div>
        <label>Número de simulações</label>
        <input id="numero-simulacoes" value="10000" />
      </div>
    </div>
  </form>
  <div class="grid-pilotos">
    <p v-for="(p, i) in tabelaPilotos" :key="i">{{ p.nome }}: {{ p.pontuacao }}</p>
  </div>
</template>

<style scoped>
.form-json {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-json textarea {
  height: 27em;
}

.form-json button {
  height: 3em;
  background-color: rgb(0, 88, 12);
}

.form-json button:hover {
  background-color: rgb(0, 51, 7);
}

.grid-pilotos {
  margin-top: 1em;
  display: grid;
  grid-template-columns: auto auto auto auto;
  gap: 5px;
}

.pilotos {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.config {
  margin-top: 1em;
  display: flex;
  justify-content: space-around;
}

.config label {
  margin-right: 1em;
}
</style>

<style>
body {
  background-color: black;
  color: white;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}

input,
textarea,
button {
  background-color: black;
  color: white;
  border: 1px solid white;
  padding: 3px 5px;
  font-size: medium;
}
</style>
