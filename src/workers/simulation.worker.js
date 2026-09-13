const racePontuation = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const sprintPontuation = [8, 7, 6, 5, 4, 3, 2, 1];

function simulateSingle({
  driverInfo = [],
  racesRemaining = 0,
  sprintsRemaining = 0,
  numSimulations = 10000,
}) {
  const numDrivers = driverInfo.length;
  if (numDrivers === 0) {
    return { chances: [], decimals: 2 };
  }

  const decimals = numSimulations < 100000 ? 2 : 3;

  // Pré-aloca estruturas tipadas para evitar garbage collection
  const basePoints = new Float64Array(numDrivers);
  for (let i = 0; i < numDrivers; i += 1) {
    basePoints[i] = Number(driverInfo[i].points) || 0;
  }

  const currentPoints = new Float64Array(numDrivers);
  const raceWins = new Int32Array(numDrivers);
  const order = new Int32Array(numDrivers);
  const championWins = new Int32Array(numDrivers);

  const numRacePlaces = Math.min(racePontuation.length, numDrivers);
  const numSprintPlaces = Math.min(sprintPontuation.length, numDrivers);

  for (let sim = 0; sim < numSimulations; sim += 1) {
    currentPoints.set(basePoints);
    raceWins.fill(0);

    // Inicializa índices dos pilotos
    for (let i = 0; i < numDrivers; i += 1) {
      order[i] = i;
    }

    // Simula corridas principais
    for (let r = 0; r < racesRemaining; r += 1) {
      for (let pos = 0; pos < numRacePlaces; pos += 1) {
        const swapIdx = pos + Math.floor(Math.random() * (numDrivers - pos));
        const driverIdx = order[swapIdx];
        order[swapIdx] = order[pos];
        order[pos] = driverIdx;

        currentPoints[driverIdx] += racePontuation[pos];
        if (pos === 0) {
          raceWins[driverIdx] += 1;
        }
      }
    }

    // Simula corridas sprint
    for (let s = 0; s < sprintsRemaining; s += 1) {
      for (let pos = 0; pos < numSprintPlaces; pos += 1) {
        const swapIdx = pos + Math.floor(Math.random() * (numDrivers - pos));
        const driverIdx = order[swapIdx];
        order[swapIdx] = order[pos];
        order[pos] = driverIdx;

        currentPoints[driverIdx] += sprintPontuation[pos];
      }
    }

    // Determina campeão com critério de desempate (pontos -> vitórias de GP -> sorteio)
    let maxPoints = -1;
    for (let i = 0; i < numDrivers; i += 1) {
      if (currentPoints[i] > maxPoints) {
        maxPoints = currentPoints[i];
      }
    }

    let tiedDrivers = [];
    let maxWinsInTie = -1;

    for (let i = 0; i < numDrivers; i += 1) {
      if (currentPoints[i] === maxPoints) {
        if (tiedDrivers.length === 0) {
          tiedDrivers.push(i);
          maxWinsInTie = raceWins[i];
        } else if (raceWins[i] > maxWinsInTie) {
          tiedDrivers = [i];
          maxWinsInTie = raceWins[i];
        } else if (raceWins[i] === maxWinsInTie) {
          tiedDrivers.push(i);
        }
      }
    }

    const championIdx =
      tiedDrivers.length === 1
        ? tiedDrivers[0]
        : tiedDrivers[Math.floor(Math.random() * tiedDrivers.length)];

    championWins[championIdx] += 1;
  }

  return {
    chances: driverInfo.map((driver, index) => ({
      name: driver.name,
      chance: Number(
        (((championWins[index] || 0) / numSimulations) * 100).toFixed(decimals),
      ),
    })),
    decimals,
  };
}

self.onmessage = (event) => {
  // Suporte a múltiplas etapas para a página de evolução
  if (event.data?.mode === "multiStage") {
    const { stages = [], numSimulations = 10000 } = event.data;
    const stagesResult = [];

    for (let i = 0; i < stages.length; i += 1) {
      const stage = stages[i];
      const res = simulateSingle({
        driverInfo: stage.drivers,
        racesRemaining: stage.racesRemaining,
        sprintsRemaining: stage.sprintsRemaining,
        numSimulations,
      });

      stagesResult.push({
        round: stage.round,
        raceName: stage.raceName,
        shortName: stage.shortName,
        date: stage.date,
        hasSprint: stage.hasSprint,
        racesRemaining: stage.racesRemaining,
        sprintsRemaining: stage.sprintsRemaining,
        chances: res.chances,
        drivers: stage.drivers,
      });

      self.postMessage({
        type: "stageProgress",
        completed: i + 1,
        total: stages.length,
        currentStage: stage.shortName,
      });
    }

    self.postMessage({
      type: "multiStageComplete",
      stagesResult,
    });
    return;
  }

  // Comportamento original para a página inicial (Home.vue)
  const {
    driverInfo = [],
    racesRemaining = 0,
    sprintsRemaining = 0,
    numSimulations = 10000,
  } = event.data;

  const res = simulateSingle({
    driverInfo,
    racesRemaining,
    sprintsRemaining,
    numSimulations,
  });

  self.postMessage({
    chances: res.chances.map((c) => ({
      name: c.name,
      chance: c.chance.toFixed(res.decimals),
    })),
    decimals: res.decimals,
  });
};
