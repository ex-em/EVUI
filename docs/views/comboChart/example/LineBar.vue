<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
    <div class="description">
      <b>막대 데이터값이 4500보다 큰 경우 빨간색으로 표시</b>
      <br>
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
          series1: { name: 'series#1', show: true, type: 'bar', timeMode: true, showValue: { use: true } },
          series3: { name: 'series#2', show: true, type: 'line', combo: true },
        },
        labels: [],
        data: {
          series1: [],
          series3: [],
        },
      });

      const chartOptions = {
        width: '100%',
        height: '80%',
        thickness: 0.8,
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
          timeFormat: 'mm:ss',
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

          const randomValue = Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
          if (randomValue > 4500) {
            seriesData.push({ value: randomValue, color: '#FF0000' });
          } else {
            seriesData.push(randomValue);
          }
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
