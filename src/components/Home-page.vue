<script setup>
import { ref } from 'vue';
import "/node_modules/flag-icons/css/flag-icons.min.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

const tabelaPilotos = ref([]);
const jsonPilotos = ref('');
const numSimulacoes = ref(10000);
const dataUltimaCorrida = ref('');
const localUltimaCorrida = ref('');
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
 * Busca a classificação atual do campeonato de pilotos da F1 a partir de uma API externa,
 * formata os dados e os retorna como uma string JSON.
 *
 * A função realiza as seguintes etapas:
 * 1. Faz uma requisição para a API 'https://f1api.dev/api/current/drivers-championship'.
 * 2. Mapeia a resposta para um formato simplificado contendo nome, pontuação e nacionalidade.
 * 3. Converte nacionalidades específicas (ex: "Italian") para nomes de países (ex: "Italy")
 *    usando um mapa interno para garantir a correta conversão para o código ISO de 2 letras.
 * 4. Converte o array de objetos de pilotos em uma string JSON formatada.
 *
 * Em caso de falha na requisição ou no processamento, um erro é registrado no console,
 * um alerta é exibido ao usuário e uma string JSON de um array vazio ("[]") é retornada.
 *
 * @returns {Promise<string>} Uma promessa que resolve para uma string JSON com os dados dos pilotos.
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
  } catch(error) {
    console.error("Falha ao buscar dados da API:", error);
    alert("Não foi possível carregar os dados da API.");
    return { dataBR: null, nome: null };
  }
}

/**
 * Busca os dados da classificação de pilotos da API e preenche a área de texto.
 *
 * Esta função assíncrona chama `getClassificacao()` para obter a string JSON
 * dos pilotos e atualiza o valor de `jsonPilotos`, que está vinculado
 * à `<textarea>` na interface do usuário.
 */
async function importarDaAPI() {
  jsonPilotos.value = await getClassificacao();
  const ultimaCorrida = await getUltimaCorrida();
  dataUltimaCorrida.value = ultimaCorrida.dataBR;
  localUltimaCorrida.value = ultimaCorrida.nome;
}

/**
 * Analisa a string JSON de `jsonPilotos.value`, extrai os primeiros 20 objetos de pilotos,
 * ordena em ordem decrescente pela `pontuacao`, e atribui o resultado a `tabelaPilotos.value`.
 * Se ocorrer falha na análise ou no processamento, exibe um alerta com a mensagem de erro.
 */
function getJSON() {
  try {
    tabelaPilotos.value = JSON.parse(jsonPilotos.value).slice(0, 20);
    tabelaPilotos.value.sort((a, b) => b.pontuacao - a.pontuacao);
  } catch {
    alert("JSON inválido!");
  }
}

/**
 * Reordena a `tabelaPilotos` com base na pontuação em ordem decrescente.
 * Esta função é chamada quando a pontuação de um piloto é alterada.
 */
function reordenarTabela() {
  tabelaPilotos.value.sort((a, b) => b.pontuacao - a.pontuacao);
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
 * @param {string} [tipo='normal'] - Tipo da corrida ('normal' para corrida-links, qualquer outro valor para sprint).
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
 * Função-links da simulação.
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
              <input type="number" :id="p.nome" v-model.number="p.pontuacao" @change="reordenarTabela" maxlength="3" />
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
      <div class="div-container">
        <p class="ultima-corrida">Última corrida: {{ localUltimaCorrida }} em {{ dataUltimaCorrida }}</p>
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
            <tr v-for="(p, i) in tabelaPilotos" :key="i">
              <td>{{ i + 1 }}</td>
              <td><span :class="'fi fi-' + p.nacionalidade.toLowerCase()"></span>&nbsp;{{ p.nome }}</td>
              <td>{{ p.equipe }}</td>
              <td class="middle">{{ p.pontuacao }}<span class="diff">{{ i !== 0 ? p.pontuacao -
                tabelaPilotos[0].pontuacao : '' }}</span>
              </td>
              <td class="middle">{{ p.chance }}</td>
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
