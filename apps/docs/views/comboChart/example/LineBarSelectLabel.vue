<template>
  <div class="case">
    <ev-chart
      v-model:selectedLabel="defaultSelectLabel"
      :data="chartData"
      :options="chartOptions"
      @click="onClick"
    />
    <div class="description">
      <div class="badge yellow">
        v-model:selectedLabel
      </div>
      {{ defaultSelectLabel }}
      <br>
      <br>
      <div class="badge yellow">
        클릭 이벤트 데이터 (selected)
      </div>
      {{ clickedLabel }}
    </div>
  </div>
</template>

<script>
  import { ref, onMounted, reactive } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const chartData = reactive({
        series: {
          series1: { name: 'series#1', show: true, type: 'bar', showValue: { use: true } },
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
          categoryMode: true,
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        }],
        selectLabel: {
          use: true,
          limit: 1,
          useDeselectOverflow: true,
          showTip: true,
          fixedPosTop: true,
          useApproximateValue: true,
          tipBackground: '#FF0000',
          useSeriesOpacity: true,
          useLabelOpacity: true,
        },
      };

      const defaultSelectLabel = ref({
        dataIndex: [2],
      });

      const clickedLabel = ref();
      const onClick = ({ selected }) => {
        clickedLabel.value = selected;
      };

      let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

      const addRandomChartData = () => {
        timeValue = dayjs(timeValue).add(1, 'second');
        chartData.labels.push(dayjs(timeValue));

        Object.values(chartData.data).forEach((seriesData) => {
          const randomValue = Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
          seriesData.push(randomValue);
        });
      };

      onMounted(() => {
        for (let ix = 0; ix < 10; ix++) {
          addRandomChartData();
        }
      });

      return {
        chartData,
        chartOptions,
        defaultSelectLabel,
        clickedLabel,
        onClick,
      };
    },
  };
</script>

<style lang="scss" scoped>
.description {
  position: relative;
}
</style>
