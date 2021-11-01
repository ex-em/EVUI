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
      const crushTime = ref();
      const chartData = reactive({
        series: {
          series1: { name: 'series#1' },
        },
        labels: [],
        data: {
          series1: [],
        },
      });

      const chartOptions = reactive({
        type: 'line',
        width: '100%',
        height: '80%',
        padding: {
          right: 40,
        },
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
            color: '#FF0000',
            value: crushTime,
            segments: [6, 2],
            label: {
              text: 'Crush',
            },
          }],
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
          plotLines: [{
            color: '#FFA500',
            value: 3000,
            label: {
              text: 'Caution',
              fontColor: '#FFA500',
            },
          }],
        }],
      });

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
          seriesData.push(randomValue);

          if (randomValue > 4800) {
            crushTime.value = timeValue;
          }
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
