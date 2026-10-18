import { grandPrix2026, sprintRaces2026 } from "@/constants/races";
import { localSeason2026Stages } from "@/constants/season2026Results";

export const roundToCountryName = {
  1: "Austrália",
  2: "China",
  3: "Japão",
  4: "Miami",
  5: "Canadá",
  6: "Mônaco",
  7: "Espanha",
  8: "Áustria",
  9: "Grã-Bretanha",
  10: "Bélgica",
  11: "Hungria",
  12: "Holanda",
  13: "Itália",
  14: "Espanha",
  15: "Azerbaijão",
  16: "Malásia",
  17: "Singapura",
  18: "Estados Unidos",
  19: "México",
  20: "Brasil",
  21: "Las Vegas",
  22: "Catar",
  23: "Abu Dhabi",
  24: "Abu Dhabi",
};

export const countryTranslations = {
  Australia: "Austrália",
  China: "China",
  Japan: "Japão",
  Canada: "Canadá",
  Monaco: "Mônaco",
  Spain: "Espanha",
  Austria: "Áustria",
  "Great Britain": "Grã-Bretanha",
  "United Kingdom": "Grã-Bretanha",
  Belgium: "Bélgica",
  Hungary: "Hungria",
  Netherlands: "Holanda",
  Italy: "Itália",
  Azerbaijan: "Azerbaijão",
  Malaysia: "Malásia",
  Singapore: "Singapura",
  "United States": "Estados Unidos",
  Mexico: "México",
  Brazil: "Brasil",
  Qatar: "Catar",
  "United Arab Emirates": "Abu Dhabi",
  "Saudi Arabia": "Arábia Saudita",
  Bahrain: "Bahrein",
};

export function getStageCountryName(round, race) {
  if (roundToCountryName[round]) {
    return roundToCountryName[round];
  }
  if (race?.circuit?.city) {
    const city = String(race.circuit.city).toLowerCase();
    if (city.includes("miami")) return "Miami";
    if (city.includes("vegas")) return "Las Vegas";
    if (city.includes("madrid")) return "Espanha";
    if (city.includes("barcelona") || city.includes("montmelo")) return "Espanha";
    if (city.includes("monaco") || city.includes("monte carlo")) return "Mônaco";
    if (city.includes("sao paulo") || city.includes("interlagos")) return "Brasil";
  }
  if (race?.circuit?.country && countryTranslations[race.circuit.country]) {
    return countryTranslations[race.circuit.country];
  }
  return `Etapa ${round}`;
}

export function formatStageShortName(round, race) {
  if (round === 0) return "Início";
  const country = getStageCountryName(round, race);
  return `R${round} - ${country}`;
}

export function sanitizeStage(stage) {
  if (stage.round === 0) {
    return { ...stage, shortName: "Início" };
  }
  return {
    ...stage,
    shortName: formatStageShortName(stage.round),
  };
}

export async function checkChampionshipOutdated(
  lastSimulatedRound,
  latestSimulatedLeaderPoints,
) {
  const localLastRound =
    localSeason2026Stages.length > 0
      ? localSeason2026Stages[localSeason2026Stages.length - 1].round
      : 0;

  try {
    const res = await fetch("https://f1api.dev/api/current");
    if (!res.ok) {
      if (localLastRound > lastSimulatedRound) {
        return {
          isOutdated: true,
          latestCompletedRound: localLastRound,
          lastSimulatedRound,
          reason: "Nova etapa disponível na base local",
        };
      }
      return {
        isOutdated: false,
        latestCompletedRound: Math.max(localLastRound, lastSimulatedRound),
        lastSimulatedRound,
      };
    }

    const data = await res.json();
    const allRaces = Array.isArray(data?.races) ? data.races : [];
    const completedRaces = allRaces.filter(
      (r) => r.winner !== null && r.winner !== undefined,
    );

    const apiLatestRound = completedRaces.reduce(
      (max, r) => Math.max(max, Number(r.round) || 0),
      0,
    );

    const latestRound = Math.max(apiLatestRound, localLastRound);

    if (latestRound > lastSimulatedRound) {
      return {
        isOutdated: true,
        latestCompletedRound: latestRound,
        lastSimulatedRound,
        reason: `Nova etapa disputada (R${latestRound}) ainda não simulada`,
      };
    }

    if (
      latestSimulatedLeaderPoints !== undefined &&
      latestRound === lastSimulatedRound &&
      latestRound > 0
    ) {
      try {
        const standingsRes = await fetch(
          "https://f1api.dev/api/current/drivers-championship",
        );
        if (standingsRes.ok) {
          const standingsData = await standingsRes.json();
          const apiLeaderPts = Number(
            standingsData?.drivers_championship?.[0]?.points ?? 0,
          );
          if (apiLeaderPts > latestSimulatedLeaderPoints) {
            return {
              isOutdated: true,
              latestCompletedRound: latestRound,
              lastSimulatedRound,
              reason: "Pontuação oficial da API atualizada para a etapa",
            };
          }
        }
      } catch (_) {
        // Silêncio em erro de standings secundário
      }
    }

    return {
      isOutdated: false,
      latestCompletedRound: latestRound,
      lastSimulatedRound,
    };
  } catch (err) {
    if (localLastRound > lastSimulatedRound) {
      return {
        isOutdated: true,
        latestCompletedRound: localLastRound,
        lastSimulatedRound,
        reason: "Nova etapa disponível na base local",
      };
    }
    return {
      isOutdated: false,
      latestCompletedRound: lastSimulatedRound,
      lastSimulatedRound,
    };
  }
}

const CACHE_KEY = "f1_sim_championship_history_2026_v2";
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas de cache

export async function fetchChampionshipHistory(
  onProgress,
  forceRefresh = false,
) {
  // Base local com nomes sanitizados
  const baseStages = localSeason2026Stages.map(sanitizeStage);
  const lastBaseRound =
    baseStages.length > 0 ? baseStages[baseStages.length - 1].round : 0;

  // 1. Verificar cache no localStorage
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (
          parsed &&
          Date.now() - parsed.timestamp < CACHE_TTL_MS &&
          Array.isArray(parsed.data) &&
          parsed.data.length > 0
        ) {
          const cachedLastRound = parsed.data[parsed.data.length - 1]?.round ?? 0;
          // Se o cache tiver ao menos tantas etapas quanto a base local, sanitiza e usa
          if (cachedLastRound >= lastBaseRound) {
            onProgress?.("Carregado dos dados locais", 100);
            return parsed.data.map(sanitizeStage);
          }
        }
      }
    } catch (e) {
      console.warn("Falha ao ler cache local de etapas:", e);
    }
  }

  try {
    onProgress?.("Verificando se há novas etapas...", 30);

    const currentRes = await fetch("https://f1api.dev/api/current");
    if (!currentRes.ok) {
      // Se a API falhar, retornar com segurança os dados locais sem erro
      onProgress?.("Usando dados locais", 100);
      return baseStages;
    }

    const currentData = await currentRes.json();
    const allRaces = Array.isArray(currentData?.races) ? currentData.races : [];

    // Novas corridas concluídas que ainda não estão na base local
    const newCompletedRaces = allRaces.filter(
      (r) =>
        Number(r.round) > lastBaseRound &&
        r.winner !== null &&
        r.winner !== undefined,
    );

    // Se nenhuma nova etapa ocorreu além das que já temos salvas, usar a base local imediatamente!
    if (newCompletedRaces.length === 0) {
      onProgress?.("Dados locais atualizados", 100);
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: baseStages }),
        );
      } catch (err) {
        console.warn("Erro ao salvar cache de etapas:", err);
      }
      return baseStages;
    }

    // Se houver novas etapas além da base, buscar apenas as novas!
    onProgress?.("Buscando dados da nova etapa...", 60);
    const sprintRounds = [2, 4, 5, 9, 12, 17];
    const totalGPs = grandPrix2026.length;
    const totalSprints = sprintRaces2026.length;

    const newRequests = [];
    for (const race of newCompletedRaces) {
      const roundNum = Number(race.round);
      newRequests.push(
        fetch(`https://f1api.dev/api/2026/${roundNum}/race`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => ({
            round: roundNum,
            type: "race",
            results: d?.races?.results || [],
          })),
      );
      if (sprintRounds.includes(roundNum)) {
        newRequests.push(
          fetch(`https://f1api.dev/api/2026/${roundNum}/sprint/race`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => ({
              round: roundNum,
              type: "sprint",
              results: d?.races?.sprintRaceResults || [],
            })),
        );
      }
    }

    const newResponses = await Promise.all(newRequests);
    const latestStage = baseStages[baseStages.length - 1];
    const runningPoints = {};
    for (const d of latestStage.drivers) {
      runningPoints[d.name] = d.points;
    }

    for (const race of newCompletedRaces) {
      const roundNum = Number(race.round);
      const sp = newResponses.find(
        (resp) => resp.round === roundNum && resp.type === "sprint",
      );
      if (sp) {
        for (const res of sp.results) {
          const name = `${res.driver?.name || ""} ${res.driver?.surname || ""}`.trim();
          runningPoints[name] =
            (runningPoints[name] || 0) + (Number(res.points) || 0);
        }
      }

      const rc = newResponses.find(
        (resp) => resp.round === roundNum && resp.type === "race",
      );
      if (rc) {
        for (const res of rc.results) {
          const name = `${res.driver?.name || ""} ${res.driver?.surname || ""}`.trim();
          runningPoints[name] =
            (runningPoints[name] || 0) + (Number(res.points) || 0);
        }
      }

      const sprintsCompletedSoFar = sprintRounds.filter(
        (sr) => sr <= roundNum,
      ).length;

      baseStages.push({
        round: roundNum,
        raceName: race.raceName || `GP da Etapa ${roundNum}`,
        shortName: formatStageShortName(roundNum, race),
        date: race.schedule?.race?.date || "",
        hasSprint: sprintRounds.includes(roundNum),
        racesRemaining: Math.max(0, totalGPs - roundNum),
        sprintsRemaining: Math.max(0, totalSprints - sprintsCompletedSoFar),
        drivers: latestStage.drivers.map((d) => ({
          name: d.name,
          team: d.team,
          teamId: d.teamId,
          points: runningPoints[d.name] || 0,
        })),
      });
    }

    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data: baseStages }),
      );
    } catch (err) {
      console.warn("Erro ao salvar cache de etapas:", err);
    }

    onProgress?.("Concluído", 100);
    return baseStages;
  } catch (err) {
    console.warn("Erro ao consultar API, usando dados locais salvos:", err);
    onProgress?.("Usando dados locais", 100);
    return baseStages;
  }
}
