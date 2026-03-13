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
      <span class="toggle-label">너비 ({{ chartWidth }}px)</span>
      <ev-input-number v-model="chartWidth" :step="50" :min="300" :max="1000" />
      <span class="toggle-label">높이 ({{ chartHeight }}px)</span>
      <ev-input-number v-model="chartHeight" :step="20" :min="150" :max="500" />
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
    const chartData = {
      series: {
        series1: { name: 'series#1' },
      },
      data: {
        series1: [],
      },
    };

    const chartWidth = ref(600);
    const chartHeight = ref(280);
    const axesSteps = ref(null);

    const chartOptions = reactive({
      type: 'scatter',
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
          timeFormat: 'HH:mm:ss',
          interval: 'second',
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        },
      ],
    });

    const onStepsCalculated = (result) => {
      axesSteps.value = result;
    };

    let timeValue = dayjs();

    onMounted(() => {
      const series1 = [];

      for (let ix = 0; ix < 30; ix++) {
        timeValue = dayjs(timeValue).add(1, 'second');
        series1.push({ x: timeValue, y: Math.round(Math.random() * 100) });
      }

      chartData.data.series1 = series1;
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
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.toggle-label {
  vertical-align: top;
  margin-right: 7px;
}
</style>
