import { grandPrix2026, sprintRaces2026 } from "@/constants/races";
import { localSeason2026Stages } from "@/constants/season2026Results";
import {
  RACE_POINTS,
  SPRINT_POINTS,
  calculateClinchScenarios,
} from "@/services/titleEngine";

export { RACE_POINTS, SPRINT_POINTS };

export const MAX_GP_POINTS = 25;
export const MAX_SPRINT_POINTS = 8;
export const P2_GP_POINTS = 18;
export const P2_SPRINT_POINTS = 7;

/**
 * Retorna os pontos concedidos por posição (1-based index)
 */
export function getRacePointsByPosition(pos) {
  if (!pos || pos < 1 || pos > RACE_POINTS.length) return 0;
  return RACE_POINTS[pos - 1];
}

export function getSprintPointsByPosition(pos) {
  if (!pos || pos < 1 || pos > SPRINT_POINTS.length) return 0;
  return SPRINT_POINTS[pos - 1];
}

/**
 * Calcula o total de pontos máximos ainda disponíveis no campeonato
 */
export function getMaxPointsRemaining(racesRemaining, sprintsRemaining) {
  const races = Math.max(0, Number(racesRemaining) || 0);
  const sprints = Math.max(0, Number(sprintsRemaining) || 0);
  return races * MAX_GP_POINTS + sprints * MAX_SPRINT_POINTS;
}

/**
 * Fins de semana restantes segundo o calendário: [{ sprint: boolean }], um por GP.
 * A sprint é a do dia anterior ao GP, limitada ao nº de sprints restantes informado.
 * shortcut: sprints restantes além das do calendário são ignoradas aqui (dados editados à mão), tratar quando houver calendário editável.
 */
export function getRemainingWeekends(racesRemaining, sprintsRemaining) {
  const races = Math.min(grandPrix2026.length, Math.max(0, Number(racesRemaining) || 0));
  let sprintsLeft = Math.max(0, Number(sprintsRemaining) || 0);
  return grandPrix2026.slice(grandPrix2026.length - races).map((gp) => {
    const eve = new Date(Date.parse(`${gp}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
    const sprint = sprintsLeft > 0 && sprintRaces2026.includes(eve);
    if (sprint) sprintsLeft -= 1;
    return { sprint };
  });
}

/**
 * Classifica os pilotos e calcula seu status matemático para o título
 */
export function calculateChampionshipStatus(
  rawDrivers = [],
  racesRemaining = 0,
  sprintsRemaining = 0,
) {
  if (!Array.isArray(rawDrivers) || rawDrivers.length === 0) {
    return {
      drivers: [],
      maxPointsRemaining: 0,
      leader: null,
      contendersCount: 0,
      eliminatedCount: 0,
      controlsDestinyCount: 0,
      dependsOnOthersCount: 0,
    };
  }

  const races = Math.max(0, Number(racesRemaining) || 0);
  const sprints = Math.max(0, Number(sprintsRemaining) || 0);
  const maxPointsRemaining = getMaxPointsRemaining(races, sprints);

  // Ordena os pilotos por pontos decrescentes
  const sorted = [...rawDrivers].sort((a, b) => {
    const diff = (Number(b.points) || 0) - (Number(a.points) || 0);
    if (diff !== 0) return diff;
    return (Number(a.position) || 99) - (Number(b.position) || 99);
  });

  const leader = sorted[0];
  const leaderPoints = Number(leader?.points) || 0;

  let contendersCount = 0;
  let eliminatedCount = 0;
  let controlsDestinyCount = 0;
  let dependsOnOthersCount = 0;

  const driversStatus = sorted.map((driver, index) => {
    const points = Number(driver.points) || 0;
    const maxAchievable = points + maxPointsRemaining;
    const diffToLeader = leaderPoints - points;

    let status = "eliminated"; // "leader" | "controls_destiny" | "depends_on_others" | "eliminated"
    let statusLabel = "Eliminado matematicamente";
    let statusColor = "error";
    let magicNumberToEliminate = 0; // Quantos pontos o líder precisa somar para eliminar este piloto

    if (index === 0) {
      status = "leader";
      statusLabel = "Líder Atual";
      statusColor = "primary";
      contendersCount += 1;
      controlsDestinyCount += 1;
    } else if (maxAchievable < leaderPoints) {
      status = "eliminated";
      statusLabel = "Eliminado matematicamente";
      statusColor = "grey";
      eliminatedCount += 1;
      magicNumberToEliminate = 0;
    } else {
      // Piloto está vivo matematicamente
      contendersCount += 1;
      // Número mágico: quantos pontos o líder precisa marcar para que rival não consiga mais alcançá-lo
      magicNumberToEliminate = Math.max(0, maxAchievable - leaderPoints + 1);

      // Verifica se o piloto depende apenas de si:
      // Se ele vencer tudo (GPs = 25, Sprints = 8), o máximo que qualquer outro piloto (inclusive o líder)
      // pode fazer é ser 2º lugar em todas (GPs = 18, Sprints = 7).
      const maxLeaderIfDriverWinsAll =
        leaderPoints + races * P2_GP_POINTS + sprints * P2_SPRINT_POINTS;

      if (maxAchievable > maxLeaderIfDriverWinsAll) {
        status = "controls_destiny";
        statusLabel = "Depende apenas de si";
        statusColor = "success";
        controlsDestinyCount += 1;
      } else {
        status = "depends_on_others";
        statusLabel = "Depende de tropeços";
        statusColor = "warning";
        dependsOnOthersCount += 1;
      }
    }

    return {
      ...driver,
      position: index + 1,
      points,
      maxAchievable,
      diffToLeader,
      status,
      statusLabel,
      statusColor,
      magicNumberToEliminate,
    };
  });

  return {
    drivers: driversStatus,
    maxPointsRemaining,
    leader: driversStatus[0] || null,
    contendersCount,
    eliminatedCount,
    controlsDestinyCount,
    dependsOnOthersCount,
  };
}

/**
 * Calcula a análise minuciosa para o Líder do campeonato
 */
export function calculateLeaderAnalysis(
  leader,
  rival,
  racesRemaining = 0,
  sprintsRemaining = 0,
  hasSprintInNextRace = false,
  field = [], // todos os pilotos: o título é decidido contra os rivais vivos, não só contra `rival`
) {
  if (!leader) return null;

  const races = Math.max(0, Number(racesRemaining) || 0);
  const sprints = Math.max(0, Number(sprintsRemaining) || 0);
  const maxPointsRemaining = getMaxPointsRemaining(races, sprints);

  const leaderPts = Number(leader.points) || 0;
  const rivalPts = Number(rival?.points) || 0;
  const leadGap = leaderPts - rivalPts;

  // 1. Número Mágico do Líder para sacramentar o título contra o rival
  const rivalMaxPts = rivalPts + maxPointsRemaining;
  const opponents = field.filter(
    (d) => d.name !== leader.name && d.status !== "eliminated",
  );
  const fieldMaxPts = Math.max(
    rivalMaxPts,
    ...opponents.map((d) => (Number(d.points) || 0) + maxPointsRemaining),
  );
  const magicPointsNeeded = Math.max(0, fieldMaxPts - leaderPts + 1);

  // 2. Cenário em que o Rival vence 100% das etapas restantes
  const rivalWinsAllPts = rivalMaxPts;
  const minPointsIfRivalWinsAll = Math.max(0, rivalWinsAllPts - leaderPts + 1);

  // Médias por etapa (GP + sprint): os pontos mínimos já incluem as sprints
  const stages = races + sprints;
  const avgPointsNeededPerRace =
    stages > 0 ? (minPointsIfRivalWinsAll / stages).toFixed(1) : "0";

  // Ritmo seguro em pontos (a posição média é enganosa: a tabela de pontos não é linear)
  let minSafePositionDesc = "Fora dos pontos";
  if (stages > 0) {
    minSafePositionDesc =
      minPointsIfRivalWinsAll <= 0
        ? "qualquer resultado"
        : `${avgPointsNeededPerRace} pts por etapa (ex.: ${Math.ceil(minPointsIfRivalWinsAll / 15)} terceiros lugares)`;
  }

  // 3. Cenário de Match Point na Próxima Etapa
  // Se após a próxima etapa a vantagem do líder for maior que os pontos que restarão no campeonato
  const racesAfterNext = Math.max(0, races - 1);
  const sprintsAfterNext = hasSprintInNextRace
    ? Math.max(0, sprints - 1)
    : sprints;
  const pointsRemainingAfterNext = getMaxPointsRemaining(
    racesAfterNext,
    sprintsAfterNext,
  );

  // Cenários do próximo GP contra todos os rivais vivos (inclui o `rival` se `field` vier vazio)
  const clinch = calculateClinchScenarios(
    leader,
    opponents.length ? opponents : rival ? [rival] : [],
    { races, sprints, hasSprint: hasSprintInNextRace },
  );
  const canClinchInNext = clinch.rows.length > 0;
  // cada linha: posição do líder + limite de cada rival (constraints)
  const nextGpClincherScenarios = clinch.rows.map((r) => ({
    leaderPosition: r.targetPos > RACE_POINTS.length
      ? "Fora dos pontos (+0 pts)"
      : `${r.targetPos}º lugar (+${r.targetPoints} pts)`,
    constraints: r.constraints,
    pointsGain: r.targetPoints,
  }));
  const clinchCombos = { total: clinch.total, winning: clinch.winning };

  return {
    magicPointsNeeded,
    minPointsIfRivalWinsAll,
    avgPointsNeededPerRace,
    minSafePositionDesc,
    canClinchInNext,
    pointsRemainingAfterNext,
    nextGpClincherScenarios,
    clinchCombos,
    leadGap,
  };
}

/**
 * Calcula a análise para qualquer piloto desafiante (não-líder)
 */
export function calculateContenderAnalysis(
  contender,
  leader,
  racesRemaining = 0,
  sprintsRemaining = 0,
) {
  if (!contender || !leader) return null;

  const races = Math.max(0, Number(racesRemaining) || 0);
  const sprints = Math.max(0, Number(sprintsRemaining) || 0);
  const maxPointsRemaining = getMaxPointsRemaining(races, sprints);

  const contenderPts = Number(contender.points) || 0;
  const leaderPts = Number(leader.points) || 0;
  const deficit = leaderPts - contenderPts;

  const maxPossible = contenderPts + maxPointsRemaining;
  const isEliminated = maxPossible < leaderPts;

  if (isEliminated) {
    return {
      isEliminated: true,
      deficit,
      maxPossible,
      message: "Matematicamente sem chances de alcançar a pontuação atual do líder.",
    };
  }

  // Se o desafiante vencer tudo:
  // Máximo de pontos que o líder pode somar para que o desafiante ainda seja campeão
  const maxAllowedLeaderPoints = maxPossible - 1;
  const maxLeaderGainAllowed = Math.max(0, maxAllowedLeaderPoints - leaderPts);
  const stages = races + sprints;
  const maxLeaderAvgPerRace =
    stages > 0 ? (maxLeaderGainAllowed / stages).toFixed(1) : "0";

  // Média de pontos por etapa (GP + sprint) que o desafiante precisa descontar
  const avgPointsToDiscount =
    stages > 0 ? (deficit / stages).toFixed(1) : "0";

  // Piso: cada GP em que o líder zera e o desafiante vence troca 25 pts; com o líder em 2º a troca é só 7
  const dnfEquivalentsNeeded = Math.ceil(deficit / 25);

  return {
    isEliminated: false,
    deficit,
    maxPossible,
    maxAllowedLeaderPoints,
    maxLeaderGainAllowed,
    maxLeaderAvgPerRace,
    avgPointsToDiscount,
    dnfEquivalentsNeeded,
  };
}

/**
 * Matriz de pontuação comparativa entre 2 posições por corrida
 */
export function calculateRaceDiffMatrix() {
  const matrix = [];
  for (let l = 1; l <= 10; l += 1) {
    const row = { leaderPos: l, leaderPts: getRacePointsByPosition(l), diffs: [] };
    for (let r = 1; r <= 10; r += 1) {
      const rPts = getRacePointsByPosition(r);
      row.diffs.push({
        rivalPos: r,
        rivalPts: rPts,
        diff: row.leaderPts - rPts,
      });
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Carrega a base inicial de pilotos e contadores da temporada atual
 */
export function getInitialChampionshipData() {
  // 1. Tenta do cache da Home
  try {
    const cached = localStorage.getItem("f1_sim_home_championship_v2");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.data?.drivers?.length > 0) {
        return {
          drivers: parsed.data.drivers,
          racesRemaining: parsed.data.racesRemaining ?? 10,
          sprintsRemaining: parsed.data.sprintsRemaining ?? 1,
          raceName: parsed.data.raceName || "",
          source: "cache",
        };
      }
    }
  } catch (e) {
    console.warn("Erro ao ler cache:", e);
  }

  // 2. Base local de segurança
  const lastStage =
    localSeason2026Stages.length > 0
      ? localSeason2026Stages[localSeason2026Stages.length - 1]
      : null;

  if (lastStage) {
    return {
      drivers: lastStage.drivers,
      racesRemaining: lastStage.racesRemaining ?? 10,
      sprintsRemaining: lastStage.sprintsRemaining ?? 1,
      raceName: lastStage.raceName || "Temporada 2026",
      source: "local",
    };
  }

  return {
    drivers: [],
    racesRemaining: 10,
    sprintsRemaining: 1,
    raceName: "",
    source: "empty",
  };
}
