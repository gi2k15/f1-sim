<script setup>
import { ref, computed } from 'vue';
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import ptLocale from "i18n-iso-countries/langs/pt.json";
import "/node_modules/flag-icons/css/flag-icons.min.css";
import CardDriverSmall from './CardDriverSmall.vue';

countries.registerLocale(enLocale);
countries.registerLocale(ptLocale);

const tabelaPilotos = ref([]);
const numSimulacoes = defineModel('numSimulacoes', { default: 10000, type: [Number] });
const dataUltimaCorrida = ref('');
const localUltimaCorrida = ref('');
const simulacaoConcluida = ref(false);
const isSimulating = ref(false);
const corridasRestantes = defineModel('corridasRestantes')
const sprintsRestantes = defineModel('sprintsRestantes')
let chances = [];

const pilotosOrdenados = computed(() => {
  const ordenados = [...tabelaPilotos.value].sort((a, b) => b.pontuacao - a.pontuacao);
  if (ordenados.length === 0) return [];
  const pontuacaoLider = ordenados[0].pontuacao;
  ordenados.forEach((p, i) => {
    const pontuacaoAtual = typeof p.pontuacao === 'number' ? p.pontuacao : 0;
    const pontuacaoAnterior = i > 0 && typeof ordenados[i - 1].pontuacao === 'number'
      ? ordenados[i - 1].pontuacao
      : 0;
    p.diferencaLider = i === 0 ? 0 : pontuacaoLider - pontuacaoAtual;
    p.diferencaAnterior = i === 0 ? 0 : pontuacaoAnterior - pontuacaoAtual;
  });
  return ordenados;
});

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

const teamLogos = {
  "McLaren Formula 1 Team": {
    alt: "McLaren Formula 1 Team",
    src: "/logos/2025mclarenlogo.avif"
  },
  "Red Bull Racing": {
    alt: "Red Bull Racing",
    src: "/logos/2025redbullracinglogo.avif"
  },
  "Mercedes Formula 1 Team": {
    alt: "Mercedes Formula 1 Team",
    src: "/logos/2025mercedeslogo.avif"
  },
  "Scuderia Ferrari": {
    alt: "Scuderia Ferrari",
    src: "/logos/2025ferrarilogo.avif"
  },
  "Williams Racing": {
    alt: "Williams Racing",
    src: "/logos/2025williamslogo.avif"
  },
  "RB F1 Team": {
    alt: "RB F1 Team",
    src: "/logos/2025racingbullslogo.avif"
  },
  "Sauber F1 Team": {
    alt: "Sauber F1 Team",
    src: "/logos/2025kicksauberlogo.avif"
  },
  "Aston Martin F1 Team": {
    alt: "Aston Martin F1 Team",
    src: "/logos/2025astonmartinlogo.avif"
  },
  "Haas F1 Team": {
    alt: "Haas F1 Team",
    src: "/logos/2025haaslogo.avif"
  },
  "Alpine F1 Team": {
    alt: "Alpine F1 Team",
    src: "/logos/2025alpinelogo.avif"
  }
}

/**
 * Busca a classificação atual do campeonato de pilotos da F1 a partir de uma API externa.
 *
 * Realiza uma requisição à API, formata os dados para um padrão interno (nome, pontuação, nacionalidade, equipe),
 * e trata casos específicos de nacionalidade para garantir a correta conversão para o código ISO 3166-1 alfa-2.
 *
 * @returns {Promise<Array<object>>} Uma promessa que resolve para um array de objetos de piloto.
 * Em caso de erro, exibe um alerta e retorna um array vazio.
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
    return mappedData.slice(0, 20);
  } catch (error) {
    console.error("Falha ao buscar dados da API:", error);
    alert("Não foi possível carregar a pontuação da API.");
    return []; // Retorna um array vazio em caso de erro.
  }
}

/**
 * Busca a data e o nome da última corrida de F1 a partir de uma API externa.
 *
 * @returns {Promise<{dataBR: string|null, nome: string|null}>} Uma promessa que resolve para um objeto
 * contendo a data formatada (DD/MM/AAAA) e o nome da corrida. Em caso de erro, retorna null para ambos os campos.
 */
async function getUltimaCorrida() {
  try {
    const apiLastRace = 'https://f1api.dev/api/current/last';
    const response = await fetch(apiLastRace);
    if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
    const j = await response.json();
    const data = new Date(j.race[0].schedule.race.date);
    const dataBR = data.toLocaleDateString('pt-BR');
    const nome = j.race[0].raceName;
    return { dataBR, nome };
  } catch (error) {
    console.error("Falha ao buscar dados da API:", error);
    alert("Não foi possível buscar as datas na API.");
    return { dataBR: null, nome: null };
  }
}

/**
 * Converte um código de país ISO 3166-1 alfa-2 para o seu nome correspondente em português.
 * @param {string} code - O código do país de duas letras (ex: "BR", "GB").
 * @returns {string} O nome do país em português.
 */
function getCountryfromAlpha2Code(code) {
  return countries.getName(code, 'pt');
}

/**
 * Preenche a área de texto e informações da última corrida com dados da API.
 *
 * Invoca `getClassificacao()` e `getUltimaCorrida()` para obter os dados mais recentes e atualiza as refs
 * `tabelaPilotos`, `dataUltimaCorrida` e `localUltimaCorrida`.
 */
async function importarDaAPI() {
  tabelaPilotos.value = await getClassificacao();
  const ultimaCorrida = await getUltimaCorrida();
  dataUltimaCorrida.value = ultimaCorrida.dataBR;
  localUltimaCorrida.value = ultimaCorrida.nome.replace(' 2025', '');
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

corridasRestantes.value = datasRestantes(dataCorridas);
sprintsRestantes.value = datasRestantes(dataSprints);

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
  let ordem = [...pilotos];
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
async function simular() {
  if (isSimulating.value) return; // Impede múltiplos cliques
  isSimulating.value = true;
  simulacaoConcluida.value = false; // Reseta para re-acionar a animação
  // Permite que a UI atualize para "Processando..." antes de iniciar o cálculo pesado.
  await new Promise(resolve => setTimeout(resolve, 0));
  try {
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
      p.chance = chanceObj ? chanceObj.chance : "0.00";
    });
    // Adicionado para acionar a animação após um pequeno atraso
    setTimeout(() => {
      simulacaoConcluida.value = true;
    }, 10);
  } finally {
    isSimulating.value = false; // Garante que o estado volte ao normal, mesmo se houver erro.
  }
}
</script>

<template>
  <div class="container">
    <h1>Simulador de campeonato de Fórmula 1</h1>
    <p><a href="#" @click="importarDaAPI()">Importar pontuação</a></p>
    <div class="config">
      <div>
        <label for="corridas-restantes">Corridas restantes</label>
        <input type="number" id="corridas-restantes" v-model="corridasRestantes">
      </div>
      <div>
        <label for="sprints-restantes">Sprints restantes</label>
        <input type="number" id="sprints-restantes" v-model="sprintsRestantes">
      </div>
      <div>
        <label for="num-simulacoes">Número de simulações</label>
        <input type="number" id="num-simulações" v-model="numSimulacoes">
      </div>
    </div>
    <p><a href="#" @click="simular()" v-if="tabelaPilotos.length > 0">
        {{ isSimulating ? "Simulando..." : `Simular ${numSimulacoes} campeonatos` }}
      </a></p>
    <div v-if="tabelaPilotos.length > 0" class="tabela-piloto">
      <p class="ultima-corrida">Última corrida: {{ localUltimaCorrida }} em {{ dataUltimaCorrida }}</p>
      <div class="grid-cards">
        <CardDriverSmall v-for="(p, i) in pilotosOrdenados" :key="p.nome" :position="i + 1" :name="p.nome"
          :points="p.pontuacao" :probability="p.chance" :teamIcon="teamLogos[p.equipe]?.src"
          :countryCode="p.nacionalidade" :countryName="getCountryfromAlpha2Code(p.nacionalidade)"
          :teamName="teamLogos[p.equipe]?.alt" :diffLeader="p.diferencaLider" :diffPrev="p.diferencaAnterior"
          v-model="p.pontuacao" />
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

.container {
  width: 700px;
  margin: 0 auto;
}

.config {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 10px;
}

.config>div {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.config input {
  width: 6rem;
}

.ultima-corrida {
  text-align: center;
  font-style: italic;
}

.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  justify-items: center;
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.grid-cards>* {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.grid-cards>*:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px rgba(64, 255, 47, 0.4);
  filter: brightness(1.1);
}

@media (max-width: 700px) {
  .container {
    width: 90vw;
  }

  .config {
    flex-direction: column;
  }
}
</style>
