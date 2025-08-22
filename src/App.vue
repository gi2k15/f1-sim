<script setup>
import { ref } from 'vue'

const tabelaPilotos = ref([]);
const jsonPilotos = ref('');
const numSimulacoes = ref(10000)

const pontosF1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const pontosSprint = [8, 7, 6, 5, 4, 3, 2, 1];

// Data de todos os grande prêmios
const dataCorridas = [
  "2025-03-16", "2025-03-23", "2025-04-06", "2025-04-13", "2025-04-20", "2025-05-04",
  "2025-05-18", "2025-05-25", "2025-06-01", "2025-06-15", "2025-06-29", "2025-07-06",
  "2025-07-27", "2025-08-03", "2025-08-31", "2025-09-07", "2025-09-21", "2025-10-05",
  "2025-10-19", "2025-10-26", "2025-11-09", "2025-11-22", "2025-11-30", "2025-12-07"
];

const dataSprints = [
  "2025-03-22", "2025-05-03", "2025-07-26", "2025-10-18", "2025-11-08", "2025-11-29"
];

function getJSON() {
  try {
    tabelaPilotos.value = JSON.parse(jsonPilotos.value).slice(0, 20);
  } catch (e) {
    alert("Erro: " + e.message);
  }
}

function datasRestantes(datas) {
  const agora = new Date();
  return datas.filter(dataStr => {
    const data = new Date(dataStr);
    return data > agora;
  }).length;
}

const corridasRestantes = ref(datasRestantes(dataCorridas));
const sprintsRestantes = ref(datasRestantes(dataSprints));

function simularCorrida(pilotos, tipo = 'normal') {
  let ordem = pilotos.slice()
  //Algoritmo para embaralhar um array de maneira efetiva.
  for (let i = ordem.lenght() - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
  let resultado = {};
  const pontos = tipo === 'normal' ? pontosF1 : pontosSprint;
  ordem.forEach((p, i) => {
    resultado[p.nome] = (resultado[p.nome] || 0) + pontos[i];
  })
}
</script>

<template>
  <form class="form-json">
    <textarea v-model="jsonPilotos" spellcheck="false"></textarea>
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
        <input :value="corridasRestantes" />
      </div>
      <div>
        <label>Corridas sprint restantes</label>
        <input :value="sprintsRestantes" />
      </div>
      <div>
        <label>Número de simulações</label>
        <input id="numero-simulacoes" v-model="numSimulacoes" />
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
