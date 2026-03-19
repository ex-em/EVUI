<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" @axes-scale-change="onStepsCalculated" />
    </resizable-wrapper>
    <div class="info-box">
      <table v-if="axesSteps">
        <thead>
          <tr>
            <th>축</th>
            <th>minSteps</th>
            <th>maxSteps</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>X[0]</td>
            <td>{{ axesSteps.x[0]?.minSteps }}</td>
            <td>{{ axesSteps.x[0]?.maxSteps }}</td>
          </tr>
          <tr>
            <td>Y[0]</td>
            <td>{{ axesSteps.y[0]?.minSteps }}</td>
            <td>{{ axesSteps.y[0]?.maxSteps }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="description">
      <span class="toggle-label">X 감지</span>
      <ev-toggle v-model="chartOptions.axesX[0].scaleChange" />
      <span class="toggle-label">Y 감지</span>
      <ev-toggle v-model="chartOptions.axesY[0].scaleChange" />
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
          scaleChange: true,
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
          scaleChange: true,
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
.info-box {
  margin-top: 10px;

  table {
    border-collapse: collapse;
    font-size: 12px;

    th,
    td {
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
.toggle-label {
  vertical-align: top;
  margin-right: 7px;
}
</style>
