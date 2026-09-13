import { grandPrix2026, sprintRaces2026 } from "@/constants/races";
import { localSeason2026Stages } from "@/constants/season2026Results";

export interface ChampionshipStage {
  round: number;
  raceName: string;
  shortName: string;
  date: string;
  hasSprint: boolean;
  racesRemaining: number;
  sprintsRemaining: number;
  drivers: {
    name: string;
    team: string;
    teamId: string;
    points: number;
  }[];
}

const CACHE_KEY = "f1_sim_championship_history_2026_v2";
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas de cache

export async function fetchChampionshipHistory(
  onProgress?: (step: string, percent: number) => void,
  forceRefresh = false,
): Promise<ChampionshipStage[]> {
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
          onProgress?.("Carregado dos dados locais", 100);
          return parsed.data;
        }
      }
    } catch (e) {
      console.warn("Falha ao ler cache local de etapas:", e);
    }
  }

  // 2. Usar dados locais pré-compilados como base (evita dezenas de chamadas às etapas passadas)
  const baseStages = [...localSeason2026Stages];
  const lastBaseRound =
    baseStages.length > 0 ? baseStages[baseStages.length - 1].round : 0;

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
      (r: any) =>
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

    // Se houver novas etapas além da 13, buscar apenas as novas!
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
    const runningPoints: Record<string, number> = {};
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
        shortName: `R${roundNum} - ${race.raceName ? race.raceName.replace(/Formula 1\s*/i, "").slice(0, 12) : ""}`,
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
