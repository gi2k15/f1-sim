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
  <form id="importar-pilotos">
    <textarea id="json-pilotos"></textarea>
    <button @click.prevent="getJSON()">Importar</button>
  </form>
  <form id="editar-pilotos">
    <div v-for="p in tabelaPilotos" :key="p.pontuacao" class="pilotos">
      <label>{{ p.nome }}</label>
      <input />
    </div>
  </form>
</template>

<style scoped>
#importar-pilotos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

#importar-pilotos textarea {
  width: 300px;
  height: 200px;
}

#editar-pilotos {
  display: grid;
  grid-template-columns: auto auto auto auto;
  gap: 5px;
}

.pilotos {
  display: flex;
  flex-direction: column;
}
</style>
