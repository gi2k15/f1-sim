// Motor multi-rival: sem imports com alias para poder ser testado direto no Node.
export const RACE_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1];

const pts = (table, pos) => table[pos - 1] ?? 0;
const maxRemaining = (races, sprints) => races * 25 + sprints * 8;

/**
 * Melhor posição (menor número) que um rival pode ter marcando no máximo `allowed` pontos.
 * 1 = sem restrição; table.length + 1 = precisa ficar fora dos pontos.
 */
function bestAllowedPos(table, allowed) {
  for (let p = 1; p <= table.length; p += 1) if (table[p - 1] <= allowed) return p;
  return table.length + 1;
}

/**
 * Condições para `target` fechar o título já no próximo fim de semana, contra TODOS os rivais vivos.
 * Cada rival é comparado só com o alvo, então a vitória é uma caixa de limites independentes:
 * "alvo termina em P" => "rival i termina em X_i ou pior". Empate conta como não-título (sem countback).
 *
 * @param {{name:string, points:number}[]} opponents rivais vivos (sem o alvo)
 * @param {{races:number, sprints:number, hasSprint?:boolean, targetSprintPos?:number}} cfg
 *   hasSprint: o próximo fim de semana tem sprint; targetSprintPos: posição do alvo nela.
 *   Sem targetSprintPos, vale o pior caso: alvo zera na sprint e rivais vencem (8 pts).
 * @returns {{rows: object[], total: number, winning: number}}
 *   rows: um por posição do alvo no GP; total/winning: combinações de GP (pilotos distintos) e as que dão título.
 */
export function calculateClinchScenarios(target, opponents, cfg) {
  const races = Math.max(0, Number(cfg.races) || 0);
  if (races === 0) return { rows: [], total: 0, winning: 0 };
  const hasSprint = !!cfg.hasSprint;
  const sprints = Math.max(0, Number(cfg.sprints) || 0);
  const after = maxRemaining(races - 1, hasSprint ? Math.max(0, sprints - 1) : sprints);
  const tSprint = hasSprint ? pts(SPRINT_POINTS, cfg.targetSprintPos ?? 99) : 0;
  const gpPositions = RACE_POINTS.length + 1; // 11 = fora dos pontos / abandono

  const rows = [];
  for (let p = 1; p <= gpPositions; p += 1) {
    const targetTotal = target.points + pts(RACE_POINTS, p) + tSprint;
    const constraints = [];
    let feasible = true;
    for (const o of opponents) {
      // pontos que o rival pode somar no GP; com sprint, assume o pior caso (rival vence a sprint)
      const gpAllowed = targetTotal - o.points - after - 1 - (hasSprint ? 8 : 0);
      if (gpAllowed < 0) { feasible = false; break; }
      let minPos = bestAllowedPos(RACE_POINTS, gpAllowed);
      if (minPos > 1 && minPos === p && p <= RACE_POINTS.length) minPos += 1; // posição já ocupada pelo alvo
      if (minPos > 1) constraints.push({ name: o.name, minPos, maxPoints: gpAllowed });
    }
    if (feasible) rows.push({ targetPos: p, targetPoints: pts(RACE_POINTS, p), constraints });
  }

  // Contagem exata: atribui posição 1..11 a cada piloto vivo (1..10 únicas; 11 repetível).
  const field = [target, ...opponents];
  const n = field.length;
  let total = 0;
  let winning = 0;
  if (n <= 8) {
    const used = new Array(gpPositions + 1).fill(false);
    const place = new Array(n);
    const walk = (i) => {
      if (i === n) {
        total += 1;
        const tt = target.points + pts(RACE_POINTS, place[0]) + tSprint;
        for (let k = 1; k < n; k += 1) {
          if (field[k].points + pts(RACE_POINTS, place[k]) + (hasSprint ? 8 : 0) + after >= tt) return;
        }
        winning += 1;
        return;
      }
      for (let p = 1; p <= gpPositions; p += 1) {
        if (p <= RACE_POINTS.length && used[p]) continue;
        used[p] = true; place[i] = p;
        walk(i + 1);
        used[p] = false;
      }
    };
    walk(0);
  }
  return { rows, total, winning };
}

/**
 * Caminho de `target` para o título vencendo TODAS as etapas restantes, contra cada rival.
 * Com o alvo vencendo tudo, nenhum rival passa de 18/GP + 7/sprint; `restricted` indica
 * quais rivais ainda podem tirar o título (têm de ser contidos a `maxAllowed` pontos).
 */
export function calculateContenderBox(target, opponents, { races, sprints }) {
  const r = Math.max(0, Number(races) || 0);
  const s = Math.max(0, Number(sprints) || 0);
  const targetMax = target.points + maxRemaining(r, s);
  const rivalCeiling = r * RACE_POINTS[1] + s * SPRINT_POINTS[1]; // alvo vence tudo => rival é 2º no máximo
  return opponents.map((o) => {
    const maxAllowed = targetMax - o.points - 1; // empate não dá título
    return {
      name: o.name,
      maxAllowed,
      avgAllowedPerStage: r + s > 0 ? Math.max(0, maxAllowed) / (r + s) : 0,
      impossible: maxAllowed < 0, // nem com o rival zerando o alvo alcança
      restricted: maxAllowed < rivalCeiling, // rival ainda pode barrar o alvo
    };
  });
}

/**
 * Resultados do próximo GP que eliminam `target` (sem sprint). Um rival elimina o alvo se
 * terminar em `needPos` ou melhor; o alvo, no melhor caso, vence todo o resto.
 * `alreadyEliminated`: nenhum resultado salva o alvo (ele zerando ou não).
 */
export function calculateEliminationScenarios(target, opponents, { races, sprints }) {
  const r = Math.max(0, Number(races) || 0);
  if (r === 0) return { rows: [], alreadyEliminated: false };
  const after = maxRemaining(r - 1, Math.max(0, Number(sprints) || 0));
  const rows = [];
  for (let p = 1; p <= RACE_POINTS.length + 1; p += 1) {
    const targetBest = target.points + pts(RACE_POINTS, p) + after;
    const killers = [];
    for (const o of opponents) {
      const need = targetBest - o.points; // rival precisa somar MAIS que isso
      if (need >= RACE_POINTS[0]) continue; // impossível neste GP
      let q = 0;
      for (let k = 1; k <= RACE_POINTS.length; k += 1) if (RACE_POINTS[k - 1] > need) q = k;
      if (need < 0) q = RACE_POINTS.length + 1; // qualquer resultado (até zerar) elimina
      if (q === 1 && p === 1) continue; // a única posição que eliminaria é a do próprio alvo
      killers.push({ name: o.name, needPos: q });
    }
    rows.push({ targetPos: p, targetPoints: pts(RACE_POINTS, p), killers });
  }
  return { rows, alreadyEliminated: rows.every((row) => row.killers.some((k) => k.needPos > RACE_POINTS.length)) };
}

// PRNG determinístico (mulberry32) para testes reprodutíveis
export function seededRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Monte Carlo do título. Cada etapa sorteia uma ordem Plackett-Luce (chave Gumbel) com peso
 * proporcional aos pontos atuais, e cada piloto abandona com `dnfRate`.
 * shortcut: peso fixo = pontos atuais (+1), sem forma recente nem circuito; trocar por ratings reais se houver dados.
 * shortcut: empate final vai para quem tem mais pontos atuais (sem countback de vitórias).
 * @returns {{name:string, titleProb:number, clinchNextProb:number, avgPoints:number}[]}
 */
export function simulateTitleOdds(drivers, { races, sprints, hasSprintNext = false }, { runs = 5000, dnfRate = 0.06, rng = Math.random } = {}) {
  const n = drivers.length;
  const r = Math.max(0, Number(races) || 0);
  const s = Math.max(0, Number(sprints) || 0);
  const logW = drivers.map((d) => Math.log((Number(d.points) || 0) + 1));
  const titles = new Array(n).fill(0);
  const clinch = new Array(n).fill(0);
  const sum = new Array(n).fill(0);
  const order = drivers.map((_, i) => i);

  const stage = (total, table) => {
    const key = logW.map((w) => w - Math.log(-Math.log(rng() || 1e-12)));
    order.sort((a, b) => key[b] - key[a]);
    let rank = 0;
    for (const i of order) {
      if (rng() < dnfRate) continue; // abandonou: zero e não ocupa posição
      total[i] += table[rank] ?? 0;
      rank += 1;
    }
  };

  for (let run = 0; run < runs; run += 1) {
    const total = drivers.map((d) => Number(d.points) || 0);
    const first = r === 0 ? [] : hasSprintNext && s > 0 ? [SPRINT_POINTS, RACE_POINTS] : [RACE_POINTS];
    const rest = new Array(Math.max(0, r - 1)).fill(RACE_POINTS);
    for (let k = first.length === 2 ? 1 : 0; k < s; k += 1) rest.splice(Math.floor(rng() * (rest.length + 1)), 0, SPRINT_POINTS);
    const stages = [...first, ...rest];
    stages.forEach((table, idx) => {
      stage(total, table);
      if (idx === first.length - 1) {
        // título fechado no fim do próximo fim de semana?
        const left = stages.slice(idx + 1).reduce((a, t) => a + t[0], 0);
        const top = total.indexOf(Math.max(...total));
        if (total.every((v, i) => i === top || total[top] > v + left)) clinch[top] += 1;
      }
    });
    let champ = 0;
    for (let i = 1; i < n; i += 1) if (total[i] > total[champ] || (total[i] === total[champ] && drivers[i].points > drivers[champ].points)) champ = i;
    titles[champ] += 1;
    total.forEach((v, i) => { sum[i] += v; });
  }
  return drivers
    .map((d, i) => ({ name: d.name, titleProb: titles[i] / runs, clinchNextProb: clinch[i] / runs, avgPoints: sum[i] / runs }))
    .sort((a, b) => b.titleProb - a.titleProb);
}

