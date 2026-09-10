const racePontuation = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const sprintPontuation = [8, 7, 6, 5, 4, 3, 2, 1];

self.onmessage = (event) => {
  const {
    driverInfo = [],
    racesRemaining = 0,
    sprintsRemaining = 0,
    numSimulations = 10000,
  } = event.data;

  const numDrivers = driverInfo.length;
  if (numDrivers === 0) {
    self.postMessage({ chances: [], decimals: 2 });
    return;
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

  self.postMessage({
    chances: driverInfo.map((driver, index) => ({
      name: driver.name,
      chance: (((championWins[index] || 0) / numSimulations) * 100).toFixed(decimals),
    })),
    decimals,
  });
};

