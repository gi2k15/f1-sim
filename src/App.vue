<script setup>
import { ref } from 'vue';

const tabelaPilotos = ref([]);
const jsonPilotos = ref('');
const numSimulacoes = ref(10000);
let chances = [];

const pontosF1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const pontosSprint = [8, 7, 6, 5, 4, 3, 2, 1];

// Exemplo de JSON
const jsonExemplo = `[
  { "nome": "Oscar Piastri", "nacionalidade": "AU", "pontuacao": 284 },
  { "nome": "Lando Norris", "nacionalidade": "GB", "pontuacao": 275 },
  { "nome": "Max Verstappen", "nacionalidade": "NL", "pontuacao": 187 },
  { "nome": "George Russell", "nacionalidade": "GB", "pontuacao": 172 },
  { "nome": "Charles Leclerc", "nacionalidade": "MC", "pontuacao": 151 },
  { "nome": "Lewis Hamilton", "nacionalidade": "GB", "pontuacao": 109 },
  { "nome": "Kimi Antonelli", "nacionalidade": "IT", "pontuacao": 64 },
  { "nome": "Alexander Albon", "nacionalidade": "TH", "pontuacao": 54 },
  { "nome": "Nico Hulkenberg", "nacionalidade": "DE", "pontuacao": 37 },
  { "nome": "Esteban Ocon", "nacionalidade": "FR", "pontuacao": 27 },
  { "nome": "Fernando Alonso", "nacionalidade": "ES", "pontuacao": 26 },
  { "nome": "Lance Stroll", "nacionalidade": "CA", "pontuacao": 26 },
  { "nome": "Isack Hadjar", "nacionalidade": "FR", "pontuacao": 22 },
  { "nome": "Pierre Gasly", "nacionalidade": "FR", "pontuacao": 20 },
  { "nome": "Liam Lawson", "nacionalidade": "NZ", "pontuacao": 20 },
  { "nome": "Carlos Sainz", "nacionalidade": "ES", "pontuacao": 16 },
  { "nome": "Gabriel Bortoleto", "nacionalidade": "BR", "pontuacao": 14 },
  { "nome": "Yuki Tsunoda", "nacionalidade": "JP", "pontuacao": 10 },
  { "nome": "Oliver Bearman", "nacionalidade": "GB", "pontuacao": 8 },
  { "nome": "Franco Colapinto", "nacionalidade": "AR", "pontuacao": 0 },
  { "nome": "Jack Doohan", "nacionalidade": "AU", "pontuacao": 0 }
]`;

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

/**
 * Analisa a string JSON de `jsonPilotos.value`, extrai os primeiros 20 objetos de pilotos,
 * ordena em ordem decrescente pela `pontuacao`, e atribui o resultado a `tabelaPilotos.value`.
 * Se ocorrer falha na análise ou no processamento, exibe um alerta com a mensagem de erro.
 */
function getJSON() {
  try {
    tabelaPilotos.value = JSON.parse(jsonPilotos.value).slice(0, 20);
    tabelaPilotos.value.sort((a, b) => b.pontuacao - a.pontuacao);
  } catch (e) {
    alert("Erro: " + e.message);
  }
}

/**
 * Retorna a quantidade de datas futuras em relação ao momento atual.
 *
 * @param {string[]} datas - Array de strings representando datas.
 * @returns {number} Quantidade de datas que ainda não passaram.
 */
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
  let temp = pilotos.map(p => ({
    nome: p.nome,
    pontuacao: Number(p.pontuacao) || 0
  }));
  for (let i = 0; i < corridas; i++) {
    const pontos = simularCorrida(temp);
    temp.forEach(p => {
      const valor = Number(pontos[p.nome]);
      p.pontuacao += isNaN(valor) ? 0 : valor;
    });
  }
  for (let i = 0; i < sprints; i++) {
    const pontos = simularCorrida(temp, 'sprint');
    temp.forEach(p => {
      const valor = Number(pontos[p.nome]);
      p.pontuacao += isNaN(valor) ? 0 : valor;
    });
  }
  return temp;
}

/**
 * Função principal da simulação.
 */
function simular() {
  let vitorias = {};
  for (let i = 0; i < numSimulacoes.value; i++) {
    const temporada = simularTemporada(tabelaPilotos.value, corridasRestantes.value, sprintsRestantes.value);
    const max = Math.max(...temporada.map(p => p.pontuacao));
    const campeao = temporada.filter(p => p.pontuacao === max);
    campeao.forEach(p => vitorias[p.nome] = (vitorias[p.nome] || 0) + 1);
  };
  chances = tabelaPilotos.value.map(p => ({
    nome: p.nome,
    chance: ((vitorias[p.nome] || 0) / numSimulacoes.value * 100).toFixed(2)
  }));
  tabelaPilotos.value.forEach(p => {
    const chanceObj = chances.find(c => c.nome === p.nome);
    p.chance = chanceObj ? chanceObj.chance : 0;
  })
}
</script>

<template>
  <div class="container">
    <form class="form-json">
      <textarea v-model="jsonPilotos" spellcheck="false"></textarea>
      <a href="#" @click="jsonPilotos = jsonExemplo">Exemplo</a>
      <button class="click-button" @click.prevent="getJSON()">Importar</button>
    </form>
    <form style="width: 100%;">
      <div class="grid-pilotos">
        <div v-for="(p, i) in tabelaPilotos" :key="i" class="pilotos">
          <label>{{ p.nome }}</label>
          <input v-model.number="p.pontuacao" maxlength="3" />
        </div>
      </div>
      <hr />
      <div class="config">
        <div>
          <label>Corridas restantes</label>
          <input v-model.number="corridasRestantes" />
        </div>
        <div>
          <label>Corridas sprint restantes</label>
          <input v-model.number="sprintsRestantes" />
        </div>
        <div>
          <label>Número de simulações</label>
          <input v-model.number="numSimulacoes" />
        </div>
      </div>
      <button class="click-button" @click.prevent="simular()" :disabled="!tabelaPilotos.length">Simular</button>
    </form>
    <table v-if="tabelaPilotos.length > 0">
      <thead>
        <tr>
          <th>P</th>
          <th>Piloto</th>
          <th>Pontos</th>
          <th>Prob. %</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(p, i) in tabelaPilotos" :key="i">
          <td>{{ i + 1 }}</td>
          <td>{{ p.nome }}</td>
          <td>{{ p.pontuacao }}<span class="diff">{{ i !== 0 ? p.pontuacao - tabelaPilotos[0].pontuacao : '' }}</span></td>
          <td>{{ p.chance }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


<style>
.container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 1em;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-json {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.form-json textarea {
  height: 18em;
  width: 100%;
  resize: vertical;
  font-size: 1em;
}

.click-button {
  height: 2.5em;
  width: 100%;
  background-color: rgb(0, 88, 12);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  margin-top: 4px;
  transition: background 0.2s;
}

.click-button:hover {
  background-color: rgb(0, 51, 7);
  cursor: pointer;
}

.click-button:disabled {
  background-color: rgb(78, 78, 78);
  cursor: not-allowed;
}

.grid-pilotos {
  margin: 1em 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  width: 100%;
  font-size: 1em;
}

.pilotos {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
}

.config {
  margin-top: 1em;
  margin-bottom: 1em;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  width: 100%;
  font-size: 1em;
}

.config>div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 140px;
}

.diff {
  margin-left: 1em;
  font-size: 0.9em;
  color: rgb(253, 72, 72);
}

table {
  width: 100%;
  margin-top: 2em;
  border-collapse: collapse;
  font-size: 1em;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  overflow: hidden;
}

thead th {
  background: #222;
  color: #fff;
  padding: 10px 6px;
  text-align: center;
}

tbody td {
  background: #111;
  color: #fff;
  padding: 8px 4px;
  text-align: center;
}

input,
textarea,
button {
  background-color: #181818;
  color: white;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 1em;
  box-sizing: border-box;
}

input:focus,
textarea:focus {
  outline: 2px solid #0a8d2b;
}

a {
  color: #0a8d2b;
}

body {
  background-color: #101010;
  color: white;
  font-family: 'Segoe UI', Verdana, Geneva, Tahoma, sans-serif;
  margin: 0;
  padding: 0;
}

@media (max-width: 700px) {
  .container {
    max-width: 100vw;
    padding: 0.5em;
  }

  .form-json {
    max-width: 100vw;
    padding: 0;
  }

  .grid-pilotos {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 6px;
    font-size: 0.95em;
  }

  .config {
    gap: 8px;
    font-size: 0.95em;
  }

  table {
    font-size: 0.95em;
  }

  thead th,
  tbody td {
    padding: 6px 2px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0.2em;
  }

  .form-json textarea {
    height: 8em;
    font-size: 0.95em;
  }

  .grid-pilotos {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 4px;
    font-size: 0.9em;
  }

  .config {
    gap: 4px;
    font-size: 0.9em;
  }

  table {
    font-size: 0.9em;
  }

  thead th,
  tbody td {
    padding: 4px 1px;
  }
}
</style>
