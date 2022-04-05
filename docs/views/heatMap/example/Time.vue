<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
    <div class="description">
      <span class="toggle-label">데이터 자동 업데이트</span>
      <ev-toggle
          v-model="isLive"
      />
    </div>
  </div>
</template>

<script>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const chartData = reactive({
        series: {
          series1: {
            name: 'series#1',
            showValue: {
              use: true,
            },
          },
        },
        labels: {
          x: [],
          y: [],
        },
        data: {
          series1: [],
        },
      });


      const chartOptions = {
        type: 'heatMap',
        width: '100%',
        height: '80%',
        title: {
          show: false,
        },
        indicator: {
          use: false,
        },
        axesX: [{
          type: 'time',
          timeFormat: 'HH:mm:ss',
          interval: 'second',
          categoryMode: true,
          showGrid: false,
        }],
        axesY: [{
          type: 'step',
          showGrid: true,
          rangeMode: true,
        }],
        heatMapColor: {
          min: '#e1fbad',
          max: '#5b904b',
          categoryCnt: 4,
          border: '#FFFFFF',
        },
        tooltip: {
          use: true,
          formatter: ({ value }) => `value: ${value}`,
        },
      };

      const getDateString = x => dayjs(x).format('HH:mm:ss');

      const isLive = ref(false);
      const liveInterval = ref();
      let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

      const addRandomChartData = () => {
        const seriesData = chartData.data.series1;

        if (isLive.value) {
          const spliceTimeValue = seriesData[0].x;
          const spliceData = seriesData.filter(({ x }) =>
              new Date(x).getTime() === new Date(spliceTimeValue).getTime());
          seriesData.splice(0, spliceData.length);
          chartData.labels.x.shift();
        }

        timeValue = dayjs(timeValue).add(1, 'second');
        chartData.labels.x.push(timeValue);

        for (let iv = 0; iv <= 5; iv++) {
          const yRandomIndex = Math.floor(Math.random() * 6);
          const yValue = chartData.labels.y[yRandomIndex];
          const randomValue = Math.floor(Math.random() * 100) + 1;
          const item = {
            x: timeValue,
            y: yValue,
            value: randomValue,
          };

          // eslint-disable-next-line no-loop-func
          const targetIndex = seriesData.findIndex(({ x, y }) =>
              new Date(x).getTime() === new Date(timeValue).getTime() && y === yValue);
          if (targetIndex === -1) {
            seriesData.push(item);
          }
        }
      };

      onMounted(() => {
        for (let iy = 0; iy < 6; iy++) {
          chartData.labels.y.push(iy);
        }

        for (let ix = 0; ix < 15; ix++) {
          addRandomChartData();
        }
      });

      watch(isLive, (newValue) => {
        if (newValue) {
          addRandomChartData();
          liveInterval.value = setInterval(addRandomChartData, 1000);
        } else {
          clearInterval(liveInterval.value);
        }
      });

      onBeforeUnmount(() => {
        clearInterval(liveInterval.value);
      });

      return {
        chartData,
        chartOptions,
        isLive,
        getDateString,
      };
    },
  };
</script>

<style lang="scss" scoped>
.case {
  height: 100%;
}
.toggle-label {
  vertical-align: top;
  margin-right: 7px;
}
</style>
