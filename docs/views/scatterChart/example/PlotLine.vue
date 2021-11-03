<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
    <div class="description">
      <span class="description-label">
        데이터 자동 업데이트
      </span>
      <ev-toggle v-model="isLive"/>
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
          series1: { name: 'series#1' },
          series2: { name: 'series#2' },
          series3: { name: 'series#3' },
        },
        labels: [],
        data: {
          series1: [],
          series2: [],
          series3: [],
        },
      });

      const chartOptions = reactive({
        type: 'scatter',
        width: '100%',
        padding: {
          right: 50,
        },
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        tooltip: {
          use: true,
        },
        axesX: [{
          type: 'time',
          timeFormat: 'HH:mm:ss',
          interval: 'second',
          plotLines: [{
            color: '#FF0000',
            value: +dayjs().subtract(40, 'second'),
            segments: [6, 2],
            label: {
              text: 'X Plot Line',
            },
          }],
          plotBands: [{
            color: 'rgba(250, 222, 76, 0.8)',
            from: +dayjs().subtract(10, 'second'),
            to: +dayjs().subtract(20, 'second'),
            label: {
              text: 'X Plot Band ZONE',
              fontColor: '#FFA500',
            },
          }],
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
          plotLines: [{
            color: '#FF0000',
            value: 2000,
            segments: [6, 2],
            label: {
              text: 'Y Plot Line',
            },
          }],
          plotBands: [{
            color: 'rgba(250, 222, 76, 0.8)',
            from: 2000,
            to: 4000,
            label: {
              text: 'Y Plot Band',
              fontColor: '#FFA500',
            },
          }],
        }],
      });

      const isLive = ref(false);
      const liveInterval = ref();
      let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

      const addRandomChartData = () => {
        timeValue = +dayjs(timeValue).add(1, 'second');
        chartData.labels.shift();
        chartData.labels.push(timeValue);

        Object.values(chartData.data).forEach((seriesData) => {
          seriesData.shift();
          seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
        });
      };

      const initChartData = () => {
        const dataKeys = Object.keys(chartData.data);
        chartData.labels.length = 0;
        for (let ix = 0; ix < dataKeys.length; ix++) {
          chartData.data[dataKeys[ix]].length = 0;
        }

        let tmpTimeValue;
        for (let ix = 0; ix < 60; ix++) {
          tmpTimeValue = +dayjs(timeValue).subtract(ix, 'second');
          chartData.labels.unshift(tmpTimeValue);

          Object.values(chartData.data).forEach((seriesData) => {
            seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
          });
        }
      };

      onMounted(() => {
        initChartData();
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
  .description-label {
    vertical-align: top;
    margin-right: 3px;
  }

  .row {
    display: flex;
    margin-top: 15px;
    justify-content: space-between;
    .row-item {
      flex: 1;
      display: flex;
      .item-title {
        line-height: 33px;
        margin-right: 3px;
        min-width: 80px;
      }
    }
  }
</style>
