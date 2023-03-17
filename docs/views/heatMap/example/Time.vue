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
      const isLive = ref(false);
      const liveInterval = ref();
      let timeValue = dayjs().add(3, 'second').format('YYYY-MM-DD HH:mm:ss');

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
          x: [
            dayjs(timeValue),
            dayjs(timeValue).add(2, 'second'),
            dayjs(timeValue).add(4, 'second'),
            dayjs(timeValue).add(6, 'second'),
            dayjs(timeValue).add(8, 'second'),
          ],
          y: [0, 1, 2, 3, 4, 5],
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
          categoryMode: true,
          showGrid: false,
          interval: {
            time: 2,
            unit: 'second',
          },
          labelStyle: {
            alignToGridLine: true,
          },
        }],
        axesY: [{
          type: 'step',
          showGrid: true,
          labelStyle: {
            alignToGridLine: true,
          },
        }],
        heatMapColor: {
          min: '#E1FBAD',
          max: '#5B904B',
          rangeCount: 4,
          stroke: {
            show: true,
            color: '#FFFFFF',
            lineWidth: 1,
          },
        },
        tooltip: {
          use: true,
          formatter: {
            title: ({ x }) => dayjs(x).format('HH:mm:ss'),
            value: ({ value }) => `${value}`,
          },
        },
      };

      timeValue = dayjs(timeValue).add(8, 'second');

      const addRandomChartData = () => {
        const seriesData = chartData.data.series1;

        if (isLive.value) {
          const spliceTimeValue = seriesData[0].x;
          const spliceData = seriesData.filter(({ x }) =>
              new Date(x).getTime() === new Date(spliceTimeValue).getTime());
          chartData.labels.x.shift();
          seriesData.splice(0, spliceData.length);
        }

        timeValue = dayjs(timeValue).add(2, 'second');
        chartData.labels.x.push(timeValue);

        const labelY = chartData.labels.y;
        for (let iy = 0; iy < labelY.length; iy++) {
          const randomCount = Math.floor(Math.random() * 50) + 1;
          chartData.data.series1.push({
            x: timeValue,
            y: labelY[iy],
            value: randomCount,
          });
        }
      };

      watch(isLive, (newValue) => {
        if (newValue) {
          addRandomChartData();
          liveInterval.value = setInterval(addRandomChartData, 1000);
        } else {
          clearInterval(liveInterval.value);
        }
      });

      const createChartData = () => {
        const labelX = chartData.labels.x;
        const labelY = chartData.labels.y;
        for (let ix = 0; ix < labelX.length; ix++) {
          for (let iy = 0; iy < labelY.length; iy++) {
            const randomCount = Math.floor(Math.random() * 50) + 1;
            chartData.data.series1.push({
              x: dayjs(labelX[ix]),
              y: labelY[iy],
              value: randomCount,
            });
          }
        }
      };

      onMounted(() => {
        createChartData();
      });

      onBeforeUnmount(() => {
        clearInterval(liveInterval.value);
      });

      return {
        chartData,
        chartOptions,
        isLive,
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
