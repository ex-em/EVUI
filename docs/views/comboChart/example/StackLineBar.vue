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
  import moment from 'moment';

  export default {
    setup() {
      const chartData = reactive({
        series: {
          series1: { name: 'series#1', show: true, type: 'bar' },
          series2: { name: 'series#2', show: true, type: 'line', combo: true, fill: true },
          series3: { name: 'series#3', show: true, type: 'line', combo: true, fill: true },
        },
        groups: [
          ['series2', 'series3'],
        ],
        labels: [],
        data: {
          series1: [],
          series2: [],
          series3: [],
        },
      });

      const chartOptions = {
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
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        }],
      };

      const isLive = ref(false);
      const liveInterval = ref();
      let timeValue = moment().format('YYYY-MM-DD HH:mm:ss');

      const addRandomChartData = () => {
        if (isLive.value) {
          chartData.labels.shift();
        }

        timeValue = +moment(timeValue).add(1, 'second');
        chartData.labels.push(+moment(timeValue));

        Object.values(chartData.data).forEach((seriesData) => {
          if (isLive.value) {
            seriesData.shift();
          }

          seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
        });
      };

      onMounted(() => {
        for (let ix = 0; ix < 10; ix++) {
          addRandomChartData();
        }
      });

      watch(isLive, (newValue) => {
        if (newValue) {
          addRandomChartData();
          liveInterval.value = setInterval(addRandomChartData, 1000);
        } else {
          clearTimeout(liveInterval.value);
        }
      });

      onBeforeUnmount(() => {
        clearTimeout(liveInterval.value);
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
