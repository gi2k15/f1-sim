// Auto-verificação: node src/services/titleEngine.test.mjs
import assert from "node:assert/strict";
import {
  calculateClinchScenarios,
  calculateContenderBox,
  calculateEliminationScenarios,
  seededRng,
  simulateTitleOdds,
} from "./titleEngine.js";

const T = { name: "A", points: 100 };
const opps = [{ name: "B", points: 70 }, { name: "C", points: 20 }];
const { rows, total, winning } = calculateClinchScenarios(T, opps, { races: 2, sprints: 0 });
const row = (p) => rows.find((r) => r.targetPos === p);

assert.equal(row(1).constraints.length, 0); // 125 vs 70+25+... gap já cobre tudo
assert.equal(row(3).constraints.find((c) => c.name === "B").minPos, 2); // 115-70-25-1=19 pts => 2º ou pior
assert.equal(row(5).constraints.find((c) => c.name === "B").minPos, 4);
assert.equal(row(11).constraints.find((c) => c.name === "B").minPos, 8); // alvo zera: B <= 4 pts
assert.ok(winning > 0 && winning < total);

// Se o rival já pode alcançar mesmo com o alvo vencendo, não há cenário
const none = calculateClinchScenarios(T, [{ name: "D", points: 99 }], { races: 5, sprints: 0 });
assert.equal(none.rows.length, 0);
assert.equal(none.winning, 0);

// Fim de semana com sprint: pior caso (alvo 0 na sprint, rival 8): 115-70-25-1-8 = 11 pts => 5º ou pior
const sp = calculateClinchScenarios(T, [{ name: "B", points: 70 }], { races: 2, sprints: 1, hasSprint: true });
assert.equal(sp.rows.find((r) => r.targetPos === 3).constraints[0].minPos, 5);

// Caixa do desafiante: A (100) vence tudo em 2 GPs = 150; C (20) nunca barra, B (70) só barra se somar > 79
const box = calculateContenderBox({ name: "X", points: 100 }, opps, { races: 2, sprints: 0 });
assert.equal(box[0].maxAllowed, 79); // 100+50-70-1
assert.equal(box[0].restricted, false); // teto do rival é 36
const tight = calculateContenderBox({ name: "X", points: 60 }, [{ name: "L", points: 100 }], { races: 2, sprints: 0 });
assert.equal(tight[0].maxAllowed, 9); // 60+50-100-1
assert.equal(tight[0].restricted, true);

// Eliminação: X (60) vs L (100), 2 GPs. Se X é 1º agora: 85+25=110; L precisa >10 => 2º ou melhor? 18>10, 15>10, 12>10 => 4º
const el = calculateEliminationScenarios({ name: "X", points: 60 }, [{ name: "L", points: 100 }], { races: 2, sprints: 0 });
assert.equal(el.rows[0].killers[0].needPos, 4);
assert.equal(el.alreadyEliminated, false);
// Já eliminado: mesmo vencendo tudo (60+50=110 < 150 após L pontuar) — L zerando no GP 1 não salva X
const dead = calculateEliminationScenarios({ name: "Y", points: 10 }, [{ name: "L", points: 100 }], { races: 2, sprints: 0 });
assert.equal(dead.alreadyEliminated, true);

// Monte Carlo reprodutível: líder com folga enorme é campeão quase sempre; probabilidades somam 1
const odds = simulateTitleOdds(
  [{ name: "L", points: 400 }, { name: "M", points: 50 }, { name: "N", points: 10 }],
  { races: 3, sprints: 1, hasSprintNext: true },
  { runs: 2000, rng: seededRng(1) },
);
assert.equal(odds[0].name, "L");
assert.ok(odds[0].titleProb > 0.99);
assert.ok(Math.abs(odds.reduce((a, o) => a + o.titleProb, 0) - 1) < 1e-9);

console.log("ok");
