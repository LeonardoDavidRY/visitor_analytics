<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Visitantes por Hora</h3>
      <div class="flex space-x-2">
        <button
          @click="chartType = 'line'"
          :class="
            chartType === 'line'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          "
          class="px-3 py-1 rounded text-sm"
        >
          Línea
        </button>
        <button
          @click="chartType = 'bar'"
          :class="
            chartType === 'bar'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          "
          class="px-3 py-1 rounded text-sm"
        >
          Barras
        </button>
      </div>
    </div>

    <div class="relative">
      <canvas ref="chartCanvas" width="400" height="200"></canvas>
    </div>

    <!-- Stats debajo del gráfico -->
    <div class="mt-4 grid grid-cols-3 gap-4 text-center">
      <div class="bg-blue-50 p-3 rounded">
        <div class="text-2xl font-bold text-blue-600">{{ stats.total }}</div>
        <div class="text-sm text-gray-600">Total Visitantes</div>
      </div>
      <div class="bg-green-50 p-3 rounded">
        <div class="text-2xl font-bold text-green-600">
          {{ stats.peak.hour }}:00
        </div>
        <div class="text-sm text-gray-600">Hora Pico</div>
      </div>
      <div class="bg-purple-50 p-3 rounded">
        <div class="text-2xl font-bold text-purple-600">
          {{ stats.average }}
        </div>
        <div class="text-sm text-gray-600">Promedio/Hora</div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import dataService from '@/services/dataService.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

export default {
  name: 'PersonCountChart',
  props: {
    startHour: {
      type: Number,
      default: 6,
    },
    endHour: {
      type: Number,
      default: 22,
    },
  },
  data() {
    return {
      chart: null,
      chartType: 'line',
      hourlyData: [],
      stats: {
        total: 0,
        peak: { hour: 0, visitors: 0 },
        average: 0,
      },
    };
  },
  mounted() {
    this.loadData();
    this.createChart();
  },
  watch: {
    chartType() {
      this.updateChart();
    },
    startHour() {
      this.loadData();
      this.updateChart();
    },
    endHour() {
      this.loadData();
      this.updateChart();
    },
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    loadData() {
      // Obtener datos filtrados por rango de horas
      const filteredData = dataService.filterByTime(
        this.startHour,
        this.endHour
      );

      // Agrupar por hora
      const hourlyGroups = {};
      filteredData.forEach((record) => {
        if (!hourlyGroups[record.hour]) {
          hourlyGroups[record.hour] = 0;
        }
        hourlyGroups[record.hour] += record.visitors.total;
      });

      // Convertir a array ordenado
      this.hourlyData = Object.keys(hourlyGroups)
        .map((hour) => ({
          hour: parseInt(hour),
          visitors: hourlyGroups[hour],
        }))
        .sort((a, b) => a.hour - b.hour);

      // Calcular estadísticas
      this.calculateStats();
    },

    calculateStats() {
      const totalVisitors = this.hourlyData.reduce(
        (sum, item) => sum + item.visitors,
        0
      );
      const peakHour = this.hourlyData.reduce(
        (max, current) => (current.visitors > max.visitors ? current : max),
        { hour: 0, visitors: 0 }
      );

      this.stats = {
        total: totalVisitors,
        peak: peakHour,
        average: Math.round(totalVisitors / this.hourlyData.length) || 0,
      };
    },

    createChart() {
      const ctx = this.$refs.chartCanvas.getContext('2d');

      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: this.getChartData(),
        options: this.getChartOptions(),
      });
    },

    updateChart() {
      if (this.chart) {
        this.chart.destroy();
      }
      this.createChart();
    },

    getChartData() {
      const labels = this.hourlyData.map((item) => `${item.hour}:00`);
      const data = this.hourlyData.map((item) => item.visitors);

      return {
        labels: labels,
        datasets: [
          {
            label: 'Visitantes',
            data: data,
            backgroundColor:
              this.chartType === 'bar'
                ? 'rgba(59, 130, 246, 0.6)'
                : 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            fill: this.chartType === 'line',
            tension: 0.4, // Suavizar líneas
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      };
    },

    getChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return `Visitantes: ${context.parsed.y}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hora del Día',
              color: '#6B7280',
            },
            grid: {
              color: 'rgba(107, 114, 128, 0.1)',
            },
            ticks: {
              color: '#6B7280',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Número de Visitantes',
              color: '#6B7280',
            },
            beginAtZero: true,
            grid: {
              color: 'rgba(107, 114, 128, 0.1)',
            },
            ticks: {
              color: '#6B7280',
              callback: function (value) {
                return Math.floor(value);
              },
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        elements: {
          point: {
            hoverRadius: 8,
          },
        },
      };
    },
  },
};
</script>

<style scoped>
canvas {
  max-height: 300px;
}
</style>
