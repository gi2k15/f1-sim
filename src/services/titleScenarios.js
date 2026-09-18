import { grandPrix2026, sprintRaces2026 } from "@/constants/races";
import { localSeason2026Stages } from "@/constants/season2026Results";

export const RACE_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1];

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
  const magicPointsNeeded = Math.max(0, rivalMaxPts - leaderPts + 1);

  // 2. Cenário em que o Rival vence 100% das etapas restantes
  const rivalWinsAllPts = rivalMaxPts;
  const minPointsIfRivalWinsAll = Math.max(0, rivalWinsAllPts - leaderPts + 1);

  // Média de pontos por GP necessária caso o rival vença tudo
  const avgPointsNeededPerRace =
    races > 0 ? (minPointsIfRivalWinsAll / races).toFixed(1) : "0";

  // Identifica a posição média correspondente na F1
  let minSafePositionDesc = "Fora dos pontos";
  if (races > 0) {
    const perRaceTarget = minPointsIfRivalWinsAll / races;
    if (perRaceTarget <= 0) {
      minSafePositionDesc = "Qualquer posição";
    } else if (perRaceTarget <= 1) {
      minSafePositionDesc = "10º lugar em média (1 pt/GP)";
    } else if (perRaceTarget <= 2) {
      minSafePositionDesc = "9º lugar em média (2 pts/GP)";
    } else if (perRaceTarget <= 4) {
      minSafePositionDesc = "8º lugar em média (4 pts/GP)";
    } else if (perRaceTarget <= 6) {
      minSafePositionDesc = "7º lugar em média (6 pts/GP)";
    } else if (perRaceTarget <= 8) {
      minSafePositionDesc = "6º lugar em média (8 pts/GP)";
    } else if (perRaceTarget <= 10) {
      minSafePositionDesc = "5º lugar em média (10 pts/GP)";
    } else if (perRaceTarget <= 12) {
      minSafePositionDesc = "4º lugar em média (12 pts/GP)";
    } else if (perRaceTarget <= 15) {
      minSafePositionDesc = "3º lugar (Pódio) em média (15 pts/GP)";
    } else if (perRaceTarget <= 18) {
      minSafePositionDesc = "2º lugar em média (18 pts/GP)";
    } else {
      minSafePositionDesc =
        "Precisa vencer ao menos algumas etapas (mais de 18 pts/GP)";
    }
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

  const canClinchInNext =
    leadGap + (MAX_GP_POINTS + (hasSprintInNextRace ? MAX_SPRINT_POINTS : 0)) >
    pointsRemainingAfterNext;

  // Gera as combinações de resultado no próximo GP que garantem o título
  const nextGpClincherScenarios = [];
  if (canClinchInNext && races > 0) {
    const leaderPossiblePositions = [1, 2, 3, 4, 5, 6];
    for (const lPos of leaderPossiblePositions) {
      const lGain = getRacePointsByPosition(lPos);
      let rivalMaxSafePos = null;

      // Testa posições do rival de 1 a 11 (11 = fora dos pontos)
      for (let rPos = 1; rPos <= 11; rPos += 1) {
        const rGain = rPos <= 10 ? getRacePointsByPosition(rPos) : 0;
        const newGap = leaderPts + lGain - (rivalPts + rGain);
        if (newGap > pointsRemainingAfterNext) {
          rivalMaxSafePos = rPos;
          break;
        }
      }

      if (rivalMaxSafePos !== null) {
        let rivalCondition = "";
        if (rivalMaxSafePos > 10) {
          rivalCondition = "Rival não pontuar (11º ou pior / abandono)";
        } else {
          rivalCondition = `Rival terminar em ${rivalMaxSafePos}º ou pior`;
        }

        nextGpClincherScenarios.push({
          leaderPosition: `${lPos}º lugar (+${lGain} pts)`,
          rivalCondition,
          pointsGain: lGain,
        });
      }
    }
  }

  return {
    magicPointsNeeded,
    minPointsIfRivalWinsAll,
    avgPointsNeededPerRace,
    minSafePositionDesc,
    canClinchInNext,
    pointsRemainingAfterNext,
    nextGpClincherScenarios,
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
  const maxLeaderAvgPerRace =
    races > 0 ? (maxLeaderGainAllowed / races).toFixed(1) : "0";

  // Média de pontos por GP que o desafiante precisa descontar
  const avgPointsToDiscount =
    races > 0 ? (deficit / races).toFixed(1) : "0";

  // Número mínimo de GPs em que o líder precisaria zerar (ou ficar fora do pódio)
  // caso o desafiante vença e faça 25 pts contra 0 pts do líder (+25 por GP zerado)
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
