<script setup>
import { ref } from 'vue';

const tabelaPilotos = ref([]);
const jsonPilotos = ref('');
const numSimulacoes = ref(10000);

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
    tabelaPilotos.value.sort((a, b) => b.pontuacao - a.pontuacao);
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

/**
 * Simula uma corrida de Fórmula 1 embaralhando a ordem dos pilotos e atribuindo pontos conforme o tipo de corrida.
 *
 * @param {Array} pilotos - Array de objetos representando os pilotos.
 * @param {string} [tipo='normal'] - Tipo da corrida ('normal' para corrida principal, qualquer outro valor para sprint).
 * @returns {Object} Um objeto onde as chaves são os nomes dos pilotos e os valores são os pontos acumulados na corrida.
 *
 * O algoritmo embaralha a ordem dos pilotos usando o método de Fisher-Yates e atribui pontos conforme a posição final.
 * Os pontos são definidos pelos arrays 'pontosF1' (corrida normal) ou 'pontosSprint' (corrida sprint).
 */
function simularCorrida(pilotos, tipo = 'normal') {
  let ordem = pilotos.slice();
  // Algoritmo para embaralhar um array de maneira efetiva.
  for (let i = ordem.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
  let resultado = {};
  const pontos = tipo === 'normal' ? pontosF1 : pontosSprint;
  ordem.forEach((p, i) => {
    resultado[p.nome] = (resultado[p.nome] || 0) + pontos[i];
  })
  return resultado;
}

/**
 * Simula uma temporada de corridas atualizando a pontuação de cada piloto com base nos resultados das corridas e sprints.
 *
 * @param {Array} pilotos - Array de objetos de pilotos, cada um contendo as propriedades 'nome' e 'pontuacao'.
 * @param {number} corridas - Número de corridas a serem simuladas.
 * @param {number} sprints - Número de corridas sprint a serem simuladas.
 * @returns {Object} Um objeto onde as chaves são os nomes dos pilotos e os valores são a pontuação ao final do campeonato.
 *
 * A função cria uma cópia temporária das pontuações dos pilotos, simula cada corrida e sprint,
 * e atualiza as pontuações conforme os resultados obtidos pela função `simularCorrida`.
 */
function simularTemporada(pilotos, corridas, sprints) {
  let temp = pilotos.map(p => ({ nome: p.nome, pontuacao: p.pontuacao }));
  for (let i = 0; i < corridas; i++) {
    const pontos = simularCorrida(tabelaPilotos);
    temp.forEach(p => p.pontuacao += pontos[p.nome] || 0);
  }
  for (let i = 0; i < sprints; i++) {
    const pontos = simularCorrida(tabelaPilotos, 'sprint');
    temp.forEach(p => p.pontuacao += pontos[p.nome]) || 0;
  }
  return temp;
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
  <table>
    <thead>
      <tr>
        <th>P</th>
        <th>Piloto</th>
        <th>Pontos</th>
        <th>Dif.</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(p, i) in tabelaPilotos" :key="i">
        <td>{{ i + 1 }}</td>
        <td>{{ p.nome }}</td>
        <td>{{ p.pontuacao }}</td>
        <td>{{ i !== 0 ? tabelaPilotos[i - 1].pontuacao - p.pontuacao : '' }}</td>
      </tr>
    </tbody>
  </table>
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
  cursor: pointer;
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
