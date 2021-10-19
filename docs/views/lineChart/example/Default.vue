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
  import { watch, ref, onBeforeUnmount, onMounted, reactive } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const chartData = reactive({
        series: {
          series1: { name: 'series#1', point: false },
          // series2: { name: 'series#2' },
          // series3: { name: 'series#3' },
          // series4: { name: 'series#4' },
        },
        labels: [],
        data: {
          series1: [],
          // series2: [],
          // series3: [],
          // series4: [],
        },
      });

      const chartOptions = {
        type: 'line',
        width: '100%',
        height: '80%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        axesX: [{
          type: 'time',
          timeFormat: 'HH:mm:ss',
          interval: 'second',
          plotLines: [{
            color: '#BC80BD',
            lineWidth: 2,
            value: 100.5,
            lineStyle: 'dash',
          }, {
            color: '#FF00FF',
            lineWidth: 2,
            value: 340.5,
          }],
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
          plotLines: [{
            color: '#FF0000',
            lineWidth: 2,
            value: 60.5,
            lineStyle: 'dash',
          }, {
            color: '#000000',
            lineWidth: 2,
            value: 50.5,
          }],
        }],
      };

      const isLive = ref(false);
      const liveInterval = ref();
      let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

      const addRandomChartData = () => {
        if (isLive.value) {
          chartData.labels.shift();
        }

        timeValue = dayjs(timeValue).add(1, 'second');
        chartData.labels.push(dayjs(timeValue));

        Object.values(chartData.data).forEach((seriesData) => {
          if (isLive.value) {
            seriesData.shift();
          }

          seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
        });
      };

      onMounted(() => {
        for (let ix = 0; ix < 60; ix++) {
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
