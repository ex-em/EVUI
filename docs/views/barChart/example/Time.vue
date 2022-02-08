<template>
  <div class="case">
    <ev-chart
      v-model:selectedItem="defaultSelectItem"
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
      const chartOptions = {
        type: 'bar',
        width: '100%',
        height: '80%',
        thickness: 1,
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        horizontal: false,
        axesX: [{
          type: 'time',
          showGrid: false,
          categoryMode: true,
          timeFormat: 'mm:ss',
          interval: 'second',
        }],
        axesY: [{
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
          showGrid: true,
        }],
        maxTip: {
          use: true,
          tipBackground: '#DBDBDB',
          tipTextColor: '#000000',
        },
        selectItem: {
          use: true,
          showTextTip: true,
          tipBackground: '#FF00FF',
        },
      };

      const chartData = reactive({
        series: {
          series1: { name: 'series#1' },
          series2: { name: 'series#2' },
        },
        labels: [],
        data: {
          series1: [],
          series2: [],
        },
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

      const defaultSelectItem = ref({
        seriesID: 'series1',
        dataIndex: 9,
      });

      return {
        chartData,
        chartOptions,
        isLive,
        defaultSelectItem,
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
