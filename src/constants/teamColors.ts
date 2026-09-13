export const lightTeamColors: Record<string, string> = {
  mercedes: "#007C70",
  ferrari: "#D9002A",
  mclaren: "#B85C00",
  haas: "#5F666A",
  alpine: "#0077B6",
  red_bull: "#2454A6",
  rb: "#3F65D9",
  audi: "#00A800",
  williams: "#1454B8",
  cadillac: "#8B6914",
  aston_martin: "#13795B",
};

export const darkTeamColors: Record<string, string> = {
  mercedes: "#42F5D7",
  ferrari: "#FF3654",
  mclaren: "#FF9A3D",
  haas: "#F1F3F4",
  alpine: "#4CC8FF",
  red_bull: "#78A7FF",
  rb: "#94B4FF",
  audi: "#52E252",
  williams: "#6EA2FF",
  cadillac: "#D4AF37",
  aston_martin: "#45C49A",
};

export function normalizeTeamKey(
  teamId?: string,
  teamName?: string,
  driverName?: string,
): string {
  const id = (teamId || "").toLowerCase();
  const name = (teamName || "").toLowerCase();
  const driver = (driverName || "").toLowerCase();

  if (
    id.includes("mercedes") ||
    name.includes("mercedes") ||
    driver.includes("antonelli") ||
    driver.includes("russell")
  )
    return "mercedes";
  if (
    id.includes("ferrari") ||
    name.includes("ferrari") ||
    driver.includes("leclerc") ||
    driver.includes("hamilton")
  )
    return "ferrari";
  if (
    id.includes("mclaren") ||
    name.includes("mclaren") ||
    driver.includes("norris") ||
    driver.includes("piastri")
  )
    return "mclaren";
  if (
    id.includes("red_bull") ||
    id.includes("redbull") ||
    name.includes("red bull") ||
    driver.includes("verstappen") ||
    driver.includes("hadjar")
  )
    return "red_bull";
  if (
    id.includes("aston") ||
    name.includes("aston") ||
    driver.includes("alonso") ||
    driver.includes("stroll")
  )
    return "aston_martin";
  if (
    id.includes("alpine") ||
    name.includes("alpine") ||
    driver.includes("gasly") ||
    driver.includes("colapinto")
  )
    return "alpine";
  if (
    id.includes("williams") ||
    name.includes("williams") ||
    driver.includes("albon") ||
    driver.includes("sainz")
  )
    return "williams";
  if (
    id === "rb" ||
    id.includes("racing_bulls") ||
    name.includes("rb") ||
    name.includes("racing bulls") ||
    driver.includes("lawson") ||
    driver.includes("lindblad")
  )
    return "rb";
  if (
    id.includes("haas") ||
    name.includes("haas") ||
    driver.includes("bearman") ||
    driver.includes("ocon")
  )
    return "haas";
  if (
    id.includes("audi") ||
    id.includes("sauber") ||
    name.includes("audi") ||
    name.includes("sauber") ||
    driver.includes("bortoleto") ||
    driver.includes("hulkenberg")
  )
    return "audi";
  if (
    id.includes("cadillac") ||
    name.includes("cadillac") ||
    driver.includes("perez") ||
    driver.includes("bottas")
  )
    return "cadillac";

  return "";
}

export function getTeamColor(
  driver: { name: string; team?: string; teamId?: string },
  isDark = true,
): string {
  const key = normalizeTeamKey(driver.teamId, driver.team, driver.name);
  const colors = isDark ? darkTeamColors : lightTeamColors;
  return colors[key] || (isDark ? "#90CAF9" : "#1976D2");
}
