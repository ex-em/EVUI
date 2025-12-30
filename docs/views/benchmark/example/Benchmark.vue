<template>
  <div class="benchmark-container">
    <div class="controls">
      <div class="control-group">
        <label>Chart Type</label>
        <ev-select v-model="chartType" :items="chartTypes" />
      </div>
      <div class="control-group">
        <label>Data Size</label>
        <ev-select v-model="dataSize" :items="dataSizes" />
      </div>
      <div class="control-group">
        <label>Series Count</label>
        <ev-select v-model="seriesCount" :items="seriesCounts" />
      </div>
      <div class="button-group">
        <ev-button type="primary" @click="runBenchmark">Run Benchmark</ev-button>
        <ev-button @click="runUpdateTest">Update Test (10x)</ev-button>
        <ev-button @click="runFpsTest">FPS Test (2s)</ev-button>
        <ev-button @click="clearResults">Clear Results</ev-button>
      </div>
    </div>

    <div class="metrics-panel">
      <div class="metric-card">
        <div class="metric-label">Initial Render</div>
        <div class="metric-value">{{ metrics.initialRender.toFixed(2) }} ms</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Avg Update</div>
        <div class="metric-value">{{ metrics.avgUpdate.toFixed(2) }} ms</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">FPS</div>
        <div class="metric-value" :class="fpsClass">{{ metrics.fps }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Memory (MB)</div>
        <div class="metric-value">{{ metrics.memory.toFixed(2) }}</div>
      </div>
    </div>

    <div class="chart-wrapper" ref="chartWrapper">
      <ev-chart
        v-if="showChart"
        ref="chartRef"
        :data="chartData"
        :options="chartOptions"
      />
    </div>

    <div class="results-table" v-if="benchmarkHistory.length > 0">
      <h3>Benchmark History</h3>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Data Size</th>
            <th>Series</th>
            <th>Initial (ms)</th>
            <th>Avg Update (ms)</th>
            <th>FPS</th>
            <th>Memory (MB)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in benchmarkHistory" :key="index">
            <td>{{ result.type }}</td>
            <td>{{ result.dataSize.toLocaleString() }}</td>
            <td>{{ result.seriesCount }}</td>
            <td>{{ result.initialRender.toFixed(2) }}</td>
            <td>{{ result.avgUpdate.toFixed(2) }}</td>
            <td :class="getFpsClass(result.fps)">{{ result.fps }}</td>
            <td>{{ result.memory.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import dayjs from 'dayjs';

export default {
  name: 'Benchmark',
  setup() {
    const chartRef = ref(null);
    const chartWrapper = ref(null);
    const showChart = ref(false);

    const chartType = ref('line');
    const dataSize = ref(200);
    const seriesCount = ref(1);

    const chartTypes = [
      { name: 'Line', value: 'line' },
      { name: 'Bar', value: 'bar' },
      { name: 'Scatter', value: 'scatter' },
    ];

    const dataSizes = [
      { name: '10', value: 10 },
      { name: '50', value: 50 },
      { name: '100', value: 100 },
      { name: '200', value: 200 },
      { name: '500', value: 500 },
      { name: '1,000', value: 1000 },
      { name: '10,000', value: 10000 },
      { name: '50,000', value: 50000 },
      { name: '100,000', value: 100000 },
    ];

    const seriesCounts = [
      { name: '1', value: 1 },
      { name: '10', value: 10 },
      { name: '20', value: 20 },
      { name: '50', value: 50 },
      { name: '100', value: 100 },
      { name: '500', value: 500 },
      { name: '1,000', value: 1000 },
      { name: '2,000', value: 2000 },
      { name: '5,000', value: 5000 },
      { name: '10,000', value: 10000 },
    ];

    const metrics = reactive({
      initialRender: 0,
      avgUpdate: 0,
      fps: 0,
      memory: 0,
    });

    const benchmarkHistory = ref([]);

    const chartData = reactive({
      series: {},
      labels: [],
      data: {},
    });

    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      height: '100%',
      title: {
        text: 'Performance Benchmark',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'time',
          showGrid: false,
          timeFormat: 'HH:mm:ss',
          interval: 'second',
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
        },
      ],
      tooltip: {
        use: false,
      },
    });

    const fpsClass = computed(() => getFpsClass(metrics.fps));

    function getFpsClass(fps) {
      if (fps >= 55) return 'fps-good';
      if (fps >= 30) return 'fps-warning';
      return 'fps-bad';
    }

    function generateData() {
      const size = dataSize.value;
      const count = seriesCount.value;
      const type = chartType.value;

      const series = {};
      const data = {};
      const labels = [];

      for (let i = 0; i < count; i++) {
        const seriesId = `series${i + 1}`;
        series[seriesId] = {
          name: `Series ${i + 1}`,
          point: false,
        };
        data[seriesId] = [];
      }

      const baseTime = dayjs();
      for (let i = 0; i < size; i++) {
        labels.push(baseTime.add(i, 'second'));
        for (let j = 0; j < count; j++) {
          const seriesId = `series${j + 1}`;
          if (type === 'scatter') {
            data[seriesId].push({
              x: baseTime.add(Math.floor(Math.random() * size), 'second'),
              y: Math.random() * 100,
            });
          } else {
            data[seriesId].push(Math.random() * 100 + j * 10);
          }
        }
      }

      return { series, data, labels };
    }

    function getMemoryUsage() {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize / (1024 * 1024);
      }
      return 0;
    }

    let fpsTestRunning = false;

    async function measureFps() {
      if (fpsTestRunning || !showChart.value) return;

      fpsTestRunning = true;
      const count = seriesCount.value;
      const size = dataSize.value;
      const type = chartType.value;

      const frameTimes = [];
      const testDuration = 2000;
      const startTime = performance.now();

      while (performance.now() - startTime < testDuration) {
        const frameStart = performance.now();

        const newData = {};
        for (let i = 0; i < count; i++) {
          const seriesId = `series${i + 1}`;
          newData[seriesId] = [];
          for (let j = 0; j < size; j++) {
            if (type === 'scatter') {
              newData[seriesId].push({
                x: Math.random() * size,
                y: Math.random() * 100,
              });
            } else {
              newData[seriesId].push(Math.random() * 100 + i * 10);
            }
          }
        }

        chartData.data = newData;

        await new Promise((resolve) => requestAnimationFrame(resolve));

        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
      }

      if (frameTimes.length > 0) {
        const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        metrics.fps = Math.round(1000 / avgFrameTime);
      }

      fpsTestRunning = false;
    }

    async function runBenchmark() {
      showChart.value = false;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const generatedData = generateData();

      chartOptions.type = chartType.value;
      Object.assign(chartData, generatedData);

      const memoryBefore = getMemoryUsage();
      const startTime = performance.now();

      showChart.value = true;

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const endTime = performance.now();
      metrics.initialRender = endTime - startTime;

      await new Promise((resolve) => setTimeout(resolve, 500));
      metrics.memory = getMemoryUsage() - memoryBefore;
      if (metrics.memory < 0) metrics.memory = getMemoryUsage();

      benchmarkHistory.value.push({
        type: chartType.value,
        dataSize: dataSize.value,
        seriesCount: seriesCount.value,
        initialRender: metrics.initialRender,
        avgUpdate: 0,
        fps: metrics.fps,
        memory: metrics.memory,
      });
    }

    async function runUpdateTest() {
      if (!showChart.value) {
        await runBenchmark();
      }

      const updateTimes = [];
      const count = seriesCount.value;
      const size = dataSize.value;

      for (let iteration = 0; iteration < 10; iteration++) {
        const newData = {};
        for (let i = 0; i < count; i++) {
          const seriesId = `series${i + 1}`;
          newData[seriesId] = [];

          for (let j = 0; j < size; j++) {
            if (chartType.value === 'scatter') {
              newData[seriesId].push({
                x: Math.random() * size,
                y: Math.random() * 100,
              });
            } else {
              newData[seriesId].push(Math.random() * 100 + i * 10);
            }
          }
        }

        const startTime = performance.now();
        chartData.data = newData;

        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const endTime = performance.now();
        updateTimes.push(endTime - startTime);

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      metrics.avgUpdate =
        updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;

      if (benchmarkHistory.value.length > 0) {
        const lastResult = benchmarkHistory.value[benchmarkHistory.value.length - 1];
        lastResult.avgUpdate = metrics.avgUpdate;
        lastResult.fps = metrics.fps;
      }
    }

    async function runFpsTest() {
      if (!showChart.value) {
        await runBenchmark();
      }
      await measureFps();

      if (benchmarkHistory.value.length > 0) {
        const lastResult = benchmarkHistory.value[benchmarkHistory.value.length - 1];
        lastResult.fps = metrics.fps;
      }
    }

    function clearResults() {
      benchmarkHistory.value = [];
      metrics.initialRender = 0;
      metrics.avgUpdate = 0;
      metrics.fps = 0;
      metrics.memory = 0;
      showChart.value = false;
    }

    onMounted(() => {
      if (performance.memory) {
        console.log('Memory API available');
      } else {
        console.warn('Memory API not available (use Chrome with --enable-precise-memory-info flag)');
      }
    });

    onBeforeUnmount(() => {
      fpsTestRunning = false;
    });

    return {
      chartRef,
      chartWrapper,
      showChart,
      chartType,
      dataSize,
      seriesCount,
      chartTypes,
      dataSizes,
      seriesCounts,
      metrics,
      benchmarkHistory,
      chartData,
      chartOptions,
      fpsClass,
      getFpsClass,
      runBenchmark,
      runUpdateTest,
      runFpsTest,
      clearResults,
    };
  },
};
</script>

<style lang="scss" scoped>
.benchmark-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
  padding: 16px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 12px;
    font-weight: 600;
    color: #666;
  }
}

.button-group {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.metrics-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.metric-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;

  &.fps-good {
    color: #4caf50;
  }

  &.fps-warning {
    color: #ff9800;
  }

  &.fps-bad {
    color: #f44336;
  }
}

.chart-wrapper {
  flex: 1;
  min-height: 300px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.results-table {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;

  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #333;
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    th {
      background: #f5f5f5;
      font-weight: 600;
      font-size: 12px;
      color: #666;
    }

    td {
      font-size: 14px;

      &.fps-good {
        color: #4caf50;
        font-weight: 600;
      }

      &.fps-warning {
        color: #ff9800;
        font-weight: 600;
      }

      &.fps-bad {
        color: #f44336;
        font-weight: 600;
      }
    }
  }
}
</style>
