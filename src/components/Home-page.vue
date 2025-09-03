<script setup>
import { ref, computed } from 'vue';
import "/node_modules/flag-icons/css/flag-icons.min.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

const tabelaPilotos = ref([]);
const jsonPilotos = ref('');
const numSimulacoes = ref(10000);
const dataUltimaCorrida = ref('');
const localUltimaCorrida = ref('');
const simulacaoConcluida = ref(false); // Adicionado para controlar a animação
let chances = [];

const pilotosOrdenados = computed(() => {
  const copia = [...tabelaPilotos.value];
  return copia.sort((a, b) => b.pontuacao - a.pontuacao);
})

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
 * Busca a classificação atual do campeonato de pilotos da F1 a partir de uma API externa.
 *
 * Realiza uma requisição à API, formata os dados para um padrão interno (nome, pontuação, nacionalidade, equipe),
 * e trata casos específicos de nacionalidade para garantir a correta conversão para o código ISO 3166-1 alfa-2.
 *
 * @async
 * @returns {Promise<string>} Uma promessa que resolve para uma string JSON formatada com os dados dos pilotos.
 * Em caso de erro, exibe um alerta e retorna uma string de um array JSON vazio ("[]").
 */
async function getClassificacao() {
  const API_STANDING = 'https://f1api.dev/api/current/drivers-championship';
  const paisOrigem = {
    Italian: 'Italy',
    'New Zealander': 'New Zealand',
    Argentine: 'Argentina'
  };
  try {
    const response = await fetch(API_STANDING);
    if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
    const data = await response.json();
    const classificacao = data.drivers_championship;
    const mappedData = classificacao.map(p => {
      return {
        nome: `${p.driver.name} ${p.driver.surname}`,
        pontuacao: p.points,
        // Mapeia a nacionalidade (ex: "Italian") para o nome do país (ex: "Italy") antes de obter o código.
        nacionalidade: countries.getAlpha2Code(paisOrigem[p.driver.nationality] || p.driver.nationality, "en"),
        equipe: p.team.teamName
      }
    });
    // Retorna os dados formatados como uma string JSON.
    return JSON.stringify(mappedData, null, 2);
  } catch (error) {
    console.error("Falha ao buscar dados da API:", error);
    alert("Não foi possível carregar os dados da API.");
    return "[]"; // Retorna um JSON de array vazio em caso de erro.
  }
}

/**
 * Busca a data e o nome da última corrida de F1 a partir de uma API externa.
 *
 * @async
 * @returns {Promise<{dataBR: string|null, nome: string|null}>} Uma promessa que resolve para um objeto
 * contendo a data formatada (DD/MM/AAAA) e o nome da corrida. Em caso de erro, retorna null para ambos os campos.
 */
async function getUltimaCorrida() {
  try {
    const API_LAST_RACE = 'https://f1api.dev/api/current/last/race';
    const response = await fetch(API_LAST_RACE);
    if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
    const d = await response.json();
    const data = new Date(d.races.date);
    const dataBR = data.toLocaleDateString('pt-BR');
    const nome = d.races.raceName;
    return { dataBR, nome };
  } catch (error) {
    console.error("Falha ao buscar dados da API:", error);
    alert("Não foi possível carregar os dados da API.");
    return { dataBR: null, nome: null };
  }
}

/**
 * Preenche a área de texto e informações da última corrida com dados da API.
 *
 * Invoca `getClassificacao()` e `getUltimaCorrida()` para obter os dados mais recentes
 * e atualiza as refs `jsonPilotos`, `dataUltimaCorrida` e `localUltimaCorrida`.
 * @async
 */
async function importarDaAPI() {
  jsonPilotos.value = await getClassificacao();
  const ultimaCorrida = await getUltimaCorrida();
  dataUltimaCorrida.value = ultimaCorrida.dataBR;
  localUltimaCorrida.value = ultimaCorrida.nome;
}

/**
 * Analisa a string JSON da área de texto e atualiza a tabela de pilotos.
 *
 * Converte a string da ref `jsonPilotos` para um objeto, extrai os primeiros 20 pilotos,
 * e atualiza a ref `tabelaPilotos`. A ordenação é feita reativamente pela propriedade computada `pilotosOrdenados`.
 * Em caso de falha na análise do JSON, exibe um alerta para o usuário.
 */
function getJSON() {
  try {
    simulacaoConcluida.value = false; // Reseta a animação
    tabelaPilotos.value = JSON.parse(jsonPilotos.value).slice(0, 20);
  } catch {
    alert("JSON inválido!");
  }
}

/**
 * Calcula o número de eventos futuros a partir de uma lista de datas.
 *
 * @param {string[]} datas - Um array de strings de data no formato "AAAA-MM-DD".
 * @returns {number} A quantidade de datas no array que são posteriores à data e hora atuais.
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
 * Simula o resultado de uma única corrida (normal ou sprint) e atribui pontos.
 *
 * A função embaralha a ordem dos pilotos para determinar as posições finais e distribui
 * a pontuação correspondente com base no tipo de corrida ('normal' ou 'sprint').
 *
 * @param {Array<object>} pilotos - O array de objetos de pilotos a participar da simulação.
 * @param {string} [tipo='normal'] - O tipo de corrida: 'normal' para um Grande Prêmio ou 'sprint'.
 * @returns {object} Um objeto que mapeia o nome de cada piloto aos pontos obtidos na corrida.
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
 * Simula o restante de uma temporada de F1 com base nos eventos restantes.
 *
 * A partir da pontuação atual, esta função simula todas as corridas e sprints restantes
 * para calcular a pontuação final de cada piloto ao término da temporada hipotética.
 *
 * @param {Array<object>} pilotos - O array de pilotos com sua pontuação atual.
 * @param {number} corridas - O número de Grandes Prêmios restantes a simular.
 * @param {number} sprints - O número de corridas sprint restantes a simular.
 * @returns {Array<object>} Um novo array de objetos de piloto com a pontuação final após a simulação.
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
 * Executa o processo completo de simulação de campeonato múltiplas vezes.
 *
 * Roda um número configurável de simulações de temporada (`numSimulacoes`) para calcular
 * a probabilidade de cada piloto vencer o campeonato. Ao final, atualiza cada piloto
 * na `tabelaPilotos` com sua respectiva chance de título em porcentagem.
 */
function simular() {
  simulacaoConcluida.value = false; // Reseta para re-acionar a animação
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
  });
  // Adicionado para acionar a animação após um pequeno atraso
  setTimeout(() => {
    simulacaoConcluida.value = true;
  }, 10);
}
</script>

<template>
  <div class="container">
    <h1>Simulador de campeonato de Fórmula 1</h1>
    <form class="form-json">
      <label>Tabela JSON dos pilotos</label>
      <textarea v-model="jsonPilotos" spellcheck="false" :placeholder="jsonExemplo"></textarea>
      <div class="importar-links">
        <a href="#" @click.prevent="jsonPilotos = jsonExemplo">Usar exemplo</a>
        <a href="#" @click.prevent="importarDaAPI()">Buscar dados online</a>
      </div>
      <button type="button" class="click-button" @click.prevent="getJSON()">Importar</button>
    </form>
    <div v-if="tabelaPilotos.length > 0">
      <form>
        <div class="div-container">
          <div class="grid-pilotos">
            <div v-for="(p, i) in tabelaPilotos" :key="i" class="label-inputs">
              <label>{{ p.nome }}</label>
              <input type="number" :id="p.nome" v-model.number="p.pontuacao" maxlength="3" />
            </div>
          </div>
        </div>
        <hr />
        <div class="config">
          <div>
            <label>Corridas restantes</label>
            <input type="number" class="label-inputs" v-model.number="corridasRestantes" />
          </div>
          <div>
            <label>Corridas sprint restantes</label>
            <input type="number" class="label-inputs" v-model.number="sprintsRestantes" />
          </div>
          <div>
            <label>Número de simulações</label>
            <input type="number" class="label-inputs" v-model.number="numSimulacoes" />
          </div>
        </div>
        <button type="button" class="click-button" @click.prevent="simular()"
          :disabled="!tabelaPilotos.length">Simular</button>
      </form>
      <p class="ultima-corrida">Última corrida: {{ localUltimaCorrida }} em {{ dataUltimaCorrida }}</p>
      <div class="div-container">
        <table v-if="tabelaPilotos.length > 0">
          <thead>
            <tr>
              <th style="text-align: left;">P</th>
              <th>Piloto</th>
              <th>Equipe</th>
              <th>Pontos</th>
              <th>Probabilidade (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in pilotosOrdenados" :key="i">
              <td>{{ i + 1 }}</td>
              <td><span :class="'fi fi-' + p.nacionalidade.toLowerCase()"></span>&nbsp;{{ p.nome }}</td>
              <td>{{ p.equipe }}</td>
              <td class="middle">{{ p.pontuacao }}<span class="diff">{{ i !== 0 ? p.pontuacao -
                pilotosOrdenados[0].pontuacao : '' }}</span>
              </td>
              <td class="middle probabilidade-cell" :class="{ 'fade-in': simulacaoConcluida }" :style="{ 'transition-delay': i * 50 + 'ms' }">{{ p.chance }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --cor-links: rgb(64, 255, 47);
  --cor-botao: rgb(11, 131, 0);
  --cor-botao-hover: rgb(7, 87, 0);
  --borda: 1px solid white;
  --borda-radius: 5px;
  --margin-top-botton: 1em 0;
}

body {
  color: white;
  background-color: black;
  font-family: sans-serif;
}

a {
  color: var(--cor-links);
}

button {
  margin: var(--margin-top-botton);
  height: 3em;
  background-color: var(--cor-botao);
  color: white;
  font-size: large;
  transition: background 0.3s ease;
  border: var(--borda);
  border-radius: var(--borda-radius);
  width: 100%;
}

button:hover {
  background-color: var(--cor-botao-hover);
}

input,
textarea {
  background-color: black;
  color: white;
  border-radius: var(--borda-radius);
  border: var(--borda);
  padding: 5px;
  box-sizing: border-box;
  width: 100%;
}

hr {
  margin: var(--margin-top-botton);
}

.container {
  width: 900px;
  margin: 0 auto;
}

.form-json {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.form-json textarea {
  height: 22rem;
}

.importar-links {
  display: flex;
  justify-content: space-evenly;
}

.grid-pilotos {
  width: 100%;
  flex-wrap: wrap;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  overflow-x: auto;
}

.label-inputs {
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.config {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 10px;
}

.ultima-corrida {
  text-align: center;
  font-style: italic;
}

table {
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;
}

table thead th {
  border-bottom: 2px solid white;
  padding-bottom: 10px;
}

table tbody td {
  height: 1.8em;
  vertical-align: middle;
}

.middle {
  text-align: center;
}

.diff {
  margin-left: 5px;
  font-size: 0.7em;
  color: rgb(255, 72, 72);
}

.probabilidade-cell {
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}

.probabilidade-cell.fade-in {
  opacity: 1;
}

@media (max-width: 700px) {
  .container {
    width: 90vw;
  }

  .config {
    flex-direction: column;
  }

  .div-container {
    width: 100%;
    overflow-x: auto;
  }

  .grid-pilotos {
    justify-content: center;
  }

  table {
    width: 700px;
  }
}
</style>
