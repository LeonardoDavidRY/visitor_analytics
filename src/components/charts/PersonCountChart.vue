<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Visitantes por Hora</h3>
      <div class="flex space-x-2">
        <button
          @click="loadData" 
          :disabled="loading"
          class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
        >
          {{ loading ? 'Cargando...' : 'Actualizar' }}
        </button>
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

    <!-- Estado de error -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- Estado de carga o gráfico -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">Cargando datos...</div>
    </div>
    <div v-else class="relative">
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
import apiService from '@/services/apiService.js';

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
      loading: false,
      error: null,
      updateInterval: null,
    };
  },
  mounted() {
    this.loadData();
    this.createChart();
    
    // Actualizar datos cada 30 segundos
    this.updateInterval = setInterval(this.loadData, 30000);
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
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  },
  methods: {
    async loadData() {
      try {
        this.loading = true;
        this.error = null;
        
        const apiData = await apiService.fetchData();
        const hourData = apiData.conteo_hora || {};
        
        this.hourlyData = Object.entries(hourData)
          .map(([hour, visitors]) => ({
            hour: parseInt(hour),
            visitors: visitors,
          }))
          .filter(item => {
            return item.hour >= this.startHour && item.hour <= this.endHour;
          })
          .sort((a, b) => a.hour - b.hour);

        this.calculateStats();
        
        // Usar nextTick para asegurar que el DOM esté actualizado antes de crear/actualizar el gráfico
        this.$nextTick(() => {
          if (this.chart) {
            this.updateChart();
          } else {
            this.createChart();
          }
        });
      } catch (err) {
        this.error = 'Error al cargar los datos';
        console.error('Error loading data:', err);
      } finally {
        this.loading = false;
      }
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
        average: Math.round(totalVisitors / (this.hourlyData.length || 1)),
      };
    },

    createChart() {
      // Verificar que el canvas esté disponible
      if (!this.$refs.chartCanvas) {
        console.warn('Canvas no disponible para PersonCountChart');
        return;
      }

      // Verificar que tengamos datos
      if (!this.hourlyData || this.hourlyData.length === 0) {
        console.warn('No hay datos disponibles para PersonCountChart');
        return;
      }

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
      
      // Usar nextTick para asegurar que el DOM esté actualizado
      this.$nextTick(() => {
        this.createChart();
      });
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
  max-width: 100%;
  height: 400px;
}
</style>
