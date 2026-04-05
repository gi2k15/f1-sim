const racePontuation = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const sprintPontuation = [8, 7, 6, 5, 4, 3, 2, 1];

function simulateRace(drivers, type = "race") {
  const order = [...drivers];

  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  const result = {};
  const points = type === "race" ? racePontuation : sprintPontuation;

  order.forEach((driver, index) => {
    result[driver.name] = (result[driver.name] || 0) + (points[index] ?? 0);
  });

  return result;
}

function simulateSeason(drivers, numRaces, numSprints) {
  const temp = drivers.map((driver) => ({
    name: driver.name,
    points: Number(driver.points) || 0,
  }));

  for (let i = 0; i < numRaces; i += 1) {
    const points = simulateRace(temp);

    temp.forEach((driver) => {
      const value = Number(points[driver.name]);
      driver.points += Number.isNaN(value) ? 0 : value;
    });
  }

  for (let i = 0; i < numSprints; i += 1) {
    const points = simulateRace(temp, "sprint");

    temp.forEach((driver) => {
      const value = Number(points[driver.name]);
      driver.points += Number.isNaN(value) ? 0 : value;
    });
  }

  return temp;
}

self.onmessage = (event) => {
  const {
    driverInfo,
    racesRemaining,
    sprintsRemaining,
    numSimulations,
  } = event.data;
  const wins = {};

  for (let i = 0; i < numSimulations; i += 1) {
    const season = simulateSeason(
      driverInfo,
      racesRemaining,
      sprintsRemaining,
    );
    const maxPoints = Math.max(...season.map((driver) => driver.points));
    const champions = season.filter((driver) => driver.points === maxPoints);

    champions.forEach((driver) => {
      wins[driver.name] = (wins[driver.name] || 0) + 1;
    });
  }

  self.postMessage({
    chances: driverInfo.map((driver) => ({
      name: driver.name,
      chance: (((wins[driver.name] || 0) / numSimulations) * 100).toFixed(2),
    })),
  });
};
