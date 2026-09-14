<template>
  <v-sheet
    color="transparent"
    class="position-relative w-100"
    style="min-height: 480px; height: 520px"
  >
    <Line :data="chartData" :options="chartOptions" />
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "vuetify";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line } from "vue-chartjs";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler,
);

export interface StageData {
  round: number;
  raceName: string;
  shortName: string;
  date: string;
  hasSprint: boolean;
  racesRemaining: number;
  sprintsRemaining: number;
  chances: { name: string; chance: number }[];
  drivers: {
    name: string;
    team: string;
    teamId: string;
    points: number;
  }[];
}

const props = defineProps<{
  stages: StageData[];
  selectedDrivers: string[];
}>();

const theme = useTheme();

// Paleta visual inspirada nas cores oficiais das equipes e pilotos de F1
const driverColors: Record<
  string,
  { color: string; dash?: number[]; pointStyle?: string }
> = {
  "Andrea Kimi Antonelli": { color: "#00D2BE" }, // Mercedes Verde-água
  "George Russell": { color: "#29E7D6", dash: [5, 5] }, // Mercedes Ciano pontilhado
  "Lewis Hamilton": { color: "#EF1A2D" }, // Ferrari Vermelho
  "Charles Leclerc": { color: "#B80414", dash: [4, 4] }, // Ferrari Carmim pontilhado
  "Lando Norris": { color: "#FF8000" }, // McLaren Papaya
  "Oscar Piastri": { color: "#FFB366", dash: [5, 5] }, // McLaren Laranja Claro
  "Max Verstappen": { color: "#1E41FF" }, // Red Bull Azul
  "Isack Hadjar": { color: "#7B96FF", dash: [4, 4] }, // Red Bull Azul Suave
  "Fernando Alonso": { color: "#00594F" }, // Aston Martin Verde
  "Lance Stroll": { color: "#229971", dash: [4, 4] }, // Aston Martin Esmeralda
  "Pierre Gasly": { color: "#0090FF" }, // Alpine Azul
  "Franco Colapinto": { color: "#FF87BC", dash: [5, 5] }, // Alpine Rosa
  "Alex Albon": { color: "#64C4FF" }, // Williams Azul Claro
  "Carlos Sainz": { color: "#0048BD", dash: [4, 4] }, // Williams Azul Escuro
  "Liam Lawson": { color: "#6692FF" }, // Racing Bulls Azul
  "Arvid Lindblad": { color: "#1634CB", dash: [4, 4] }, // Racing Bulls Índigo
  "Oliver Bearman": { color: "#E6002B" }, // Haas Vermelho
  "Esteban Ocon": { color: "#9E9E9E", dash: [4, 4] }, // Haas Cinza
  "Gabriel Bortoleto": { color: "#00E700" }, // Audi Verde Fluorescente
  "Nico Hülkenberg": { color: "#168B16", dash: [4, 4] }, // Audi Verde Floresta
  "Sergio Pérez": { color: "#D4AF37" }, // Cadillac Dourado
  "Valtteri Bottas": { color: "#8B6914", dash: [4, 4] }, // Cadillac Bronze
};

import { getTeamColor } from "@/constants/teamColors";

// Cores de apoio dinâmicas
const fallbackColors = [
  "#AB47BC",
  "#26A69A",
  "#FFA726",
  "#8D6E63",
  "#78909C",
  "#EC407A",
  "#5C6BC0",
  "#9CCC65",
];

function getDriverColor(name: string, index: number) {
  const isDark = theme.global.current.value.dark;
  const teamCol = getTeamColor({ name }, isDark);
  const known = driverColors[name];
  return {
    color: teamCol || known?.color || fallbackColors[index % fallbackColors.length],
    dash: known?.dash || [],
  };
}

import { formatStageShortName } from "@/services/championshipHistory";

const chartData = computed<ChartData<"line">>(() => {
  const labels = props.stages.map((s) => formatStageShortName(s.round, s));

  const datasets = props.selectedDrivers.map((driverName, idx) => {
    const styling = getDriverColor(driverName, idx);
    const dataPoints = props.stages.map((stage) => {
      const match = stage.chances.find((c) => c.name === driverName);
      return match ? match.chance : 0;
    });

    return {
      label: driverName,
      data: dataPoints,
      borderColor: styling.color,
      backgroundColor: styling.color,
      borderDash: styling.dash || [],
      borderWidth: 2.8,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: styling.color,
      tension: 0.32,
      fill: false,
    };
  });

  return {
    labels,
    datasets,
  };
});

const chartOptions = computed<ChartOptions<"line">>(() => {
  const isDark = theme.global.current.value.dark;
  const textColor = isDark ? "#E0E0E0" : "#2E2E2E";
  const mutedTextColor = isDark ? "#9E9E9E" : "#757575";
  const gridColor = isDark
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(0, 0, 0, 0.06)";
  const tooltipBg = isDark ? "#212121" : "#FFFFFF";
  const tooltipText = isDark ? "#FFFFFF" : "#1A1A1A";

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: textColor,
          font: {
            family: "Roboto, sans-serif",
            size: 12,
            weight: "bold",
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: isDark ? "#424242" : "#E0E0E0",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        itemSort: (a, b) => (b.raw as number) - (a.raw as number),
        callbacks: {
          label: (context) => {
            const driverName = context.dataset.label || "";
            const chanceVal = Number(context.raw || 0).toFixed(2);
            const stageIndex = context.dataIndex;
            const stage = props.stages[stageIndex];
            const driverInfo = stage?.drivers.find(
              (d) => d.name === driverName,
            );
            const pointsStr =
              driverInfo !== undefined ? ` (${driverInfo.points} pts)` : "";
            return ` ${driverName}: ${chanceVal}%${pointsStr}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: mutedTextColor,
          font: {
            family: "Roboto, sans-serif",
            size: 11,
          },
          maxRotation: 45,
          minRotation: 25,
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: mutedTextColor,
          font: {
            family: "Roboto, sans-serif",
            size: 11,
          },
          callback: (value) => `${value}%`,
        },
        title: {
          display: true,
          text: "Chance de Título Mundial (%)",
          color: mutedTextColor,
          font: {
            family: "Roboto, sans-serif",
            size: 12,
            weight: "bold",
          },
        },
      },
    },
  };
});
</script>
