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
import { onBeforeUnmount, reactive, ref, watch } from 'vue';
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
            timeValue,
            dayjs(timeValue).add(1, 'second'),
            dayjs(timeValue).add(2, 'second'),
            dayjs(timeValue).add(3, 'second'),
            dayjs(timeValue).add(4, 'second'),
          ],
          y: [0, 1, 2, 3, 4, 5],
        },
        data: {
          series1: [
            { x: dayjs(timeValue), y: 0, value: 46 },
            { x: dayjs(timeValue), y: 1, value: 22 },
            { x: dayjs(timeValue), y: 3, value: 15 },
            { x: dayjs(timeValue), y: 4, value: 8 },
            { x: dayjs(timeValue), y: 5, value: 10 },
            { x: dayjs(timeValue).add(1, 'second'), y: 0, value: 42 },
            { x: dayjs(timeValue).add(1, 'second'), y: 2, value: 11 },
            { x: dayjs(timeValue).add(1, 'second'), y: 3, value: 22 },
            { x: dayjs(timeValue).add(1, 'second'), y: 5, value: 15 },
            { x: dayjs(timeValue).add(1, 'second'), y: 6, value: 6 },
            { x: dayjs(timeValue).add(2, 'second'), y: 0, value: 36 },
            { x: dayjs(timeValue).add(2, 'second'), y: 1, value: 25 },
            { x: dayjs(timeValue).add(2, 'second'), y: 3, value: 13 },
            { x: dayjs(timeValue).add(2, 'second'), y: 4, value: 9 },
            { x: dayjs(timeValue).add(3, 'second'), y: 0, value: 45 },
            { x: dayjs(timeValue).add(3, 'second'), y: 2, value: 39 },
            { x: dayjs(timeValue).add(3, 'second'), y: 3, value: 3 },
            { x: dayjs(timeValue).add(4, 'second'), y: 0, value: 50 },
            { x: dayjs(timeValue).add(4, 'second'), y: 1, value: 44 },
            { x: dayjs(timeValue).add(4, 'second'), y: 4, value: 2 },
            { x: dayjs(timeValue).add(4, 'second'), y: 5, value: 8 },
          ],
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
          stroke: {
            show: true,
            color: '#FFFFFF',
            lineWidth: 1,
          },
        },
        tooltip: {
          use: true,
          formatter: ({ value }) => `value: ${value}`,
        },
      };

      timeValue = dayjs(timeValue).add(4, 'second');

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
          const randomValue = Math.floor(Math.random() * 45) + 1;
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
