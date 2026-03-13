<template>
  <div class="case">
    <div class="chart-container" :style="{ width: chartWidth + 'px', height: chartHeight + 'px' }">
      <ev-chart
        :data="chartData"
        :options="chartOptions"
        @axes-scale-change="onStepsCalculated"
      />
    </div>
    <div class="info-box">
      <table v-if="axesSteps">
        <thead>
          <tr>
            <th>축</th>
            <th>steps</th>
            <th>interval</th>
            <th>graphMin</th>
            <th>graphMax</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>X[0]</td>
            <td>{{ axesSteps.x[0]?.steps }}</td>
            <td>{{ axesSteps.x[0]?.interval }}</td>
            <td>{{ axesSteps.x[0]?.graphMin }}</td>
            <td>{{ axesSteps.x[0]?.graphMax }}</td>
          </tr>
          <tr>
            <td>Y[0]</td>
            <td>{{ axesSteps.y[0]?.steps }}</td>
            <td>{{ axesSteps.y[0]?.interval }}</td>
            <td>{{ axesSteps.y[0]?.graphMin }}</td>
            <td>{{ axesSteps.y[0]?.graphMax }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="description">
      <div class="description-row">
        <span class="toggle-label">너비 ({{ chartWidth }}px)</span>
        <ev-input-number v-model="chartWidth" :step="50" :min="300" :max="1000" />
        <span class="toggle-label">높이 ({{ chartHeight }}px)</span>
        <ev-input-number v-model="chartHeight" :step="20" :min="150" :max="500" />
      </div>
      <div class="description-row">
        <span class="toggle-label">X 감지</span>
        <ev-toggle v-model="axesScaleChange.x" />
        <span class="toggle-label">Y 감지</span>
        <ev-toggle v-model="axesScaleChange.y" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import dayjs from 'dayjs';
import EvInputNumber from '../../../../src/components/inputNumber/InputNumber';

export default {
  components: {
    EvInputNumber,
  },
  setup() {
    const chartData = reactive({
      series: {
        series1: { name: 'series#1', point: false },
        series2: { name: 'series#2', point: false },
      },
      labels: [],
      data: {
        series1: [],
        series2: [],
      },
    });

    const chartWidth = ref(600);
    const chartHeight = ref(280);
    const axesSteps = ref(null);

    const chartOptions = reactive({
      type: 'bar',
      width: '100%',
      height: '100%',
      padding: {
        top: 20,
        right: 2,
        left: 2,
        bottom: 4,
      },
      title: {
        text: '리사이즈 시 axesSteps 변화',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'time',
          timeFormat: 'DD HH:mm',
          interval: 'hour',
          scaleChange: true,
          formatter: (value, data) => {
            if (data?.prev) {
              const curr = dayjs(value).format('yy-MM-DD');
              const prev = dayjs(data?.prev).format('yy-MM-DD');
              if (curr === prev) {
                return dayjs(value).format('HH:mm');
              }
            }
            return dayjs(value).format('DD HH:mm');
          },
          showAxisTick: true,
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          showAxisTick: true,
          scaleChange: true,
        },
      ],
    });

    const onStepsCalculated = (result) => {
      axesSteps.value = result;
    };

    let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

    onMounted(() => {
      const labels = [];
      const series1 = [];
      const series2 = [];

      for (let ix = 0; ix < 30; ix++) {
        timeValue = dayjs(timeValue).add(1, 'hour');
        labels.push(dayjs(timeValue));
        series1.push(Math.round(Math.random() * 100));
        series2.push(Math.round(Math.random() * 100));
      }

      chartData.labels = labels;
      chartData.data.series1 = series1;
      chartData.data.series2 = series2;
    });

    return {
      chartData,
      chartOptions,
      chartWidth,
      chartHeight,
      axesSteps,
      onStepsCalculated,
    };
  },
};
</script>

<style lang="scss" scoped>
.case {
  height: 100%;
}
.chart-container {
  transition: width 0.2s, height 0.2s;
}
.info-box {
  margin-top: 10px;

  table {
    border-collapse: collapse;
    font-size: 12px;

    th, td {
      border: 1px solid #ddd;
      padding: 4px 10px;
      text-align: center;
    }

    th {
      background: #f5f5f5;
      font-weight: bold;
    }
  }
}
.description {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}
.description-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.toggle-label {
  vertical-align: top;
  margin-right: 7px;
}
</style>