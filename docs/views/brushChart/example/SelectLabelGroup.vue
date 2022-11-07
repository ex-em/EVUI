<template>
  <div class="case">
    <ev-chart-group
      v-model:groupSelectedLabel="defaultGroupSelectLabel"
      v-model:zoomStartIdx='zoomStartIdx'
      v-model:zoomEndIdx='zoomEndIdx'
      :options="chartGroupOptions"
    >
      <ev-chart
        :data="chartData"
        :options="chartOptions"
        @click="onClick"
      />
      <ev-chart
        :data="chartData2"
        :options="chartOptions"
        @click="onClick"
      />
      <ev-chart-brush :options="brushOptions"/>
    </ev-chart-group>

    <div class="description">
      <div class="badge yellow">
        기본 선택값 v-model
      </div>
      {{ defaultGroupSelectLabel }}
      <br><br>
      <div class="badge yellow">
        클릭된 라벨
      </div>
      {{ clickedLabel }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    let timeValue = dayjs().format('YYYY-MM-DD');
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
    const chartData2 = reactive({
      series: {
        series11: { name: 'DB CPU' },
        series22: { name: 'DB Time' },
      },
      labels: [],
      data: {
        series11: [],
        series22: [],
      },
    });
    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      height: '80%',
      title: {
        show: false,
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [{
        type: 'time',
        timeFormat: 'YYYY-MM-DD',
        interval: 'day',
      }],
      axesY: [{
        type: 'linear',
        showGrid: true,
        startToZero: true,
        autoScaleRatio: 0.1,
      }],
      selectLabel: {
        use: true,
        useClick: true,
        limit: 2,
        useDeselectOverflow: true,
        useApproximateValue: true,
        tipBackground: '#FF0000',
        useSeriesOpacity: false,
        useLabelOpacity: false,
        showTextTip: true,
        tipText: 'label',
        showIndicator: true,
      },
    });

    const zoomStartIdx = ref();
    const zoomEndIdx = ref();
    const brushOptions = reactive({
      show: true,
      useDebounce: true,
      chartIdx: 0,
      height: 80,
      showLabel: true,
      selection: {
        fillColor: 'gray',
        opacity: 0.5,
      },
    });

    const chartGroupOptions = reactive({
      zoom: {
        toolbar: {
          show: true,
        },
      },
    });

    const defaultGroupSelectLabel = ref({
      dataIndex: [0, 3],
    });

    const clickedLabel = ref("''");
    const onClick = (target) => {
      clickedLabel.value = target.selected.label.map(label => dayjs(label).format('YYYY-MM-DD'));
    };

    const addRandomChartData = (ix) => {
      timeValue = dayjs(timeValue).add(1, 'day');
      const date = dayjs(timeValue);

      chartData.labels.push(date);
      chartData2.labels.push(date);

      const val = Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      const val2 = Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      const val3 = Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      const val4 = Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;

      if (ix >= 2) {
        Object.values(chartData.data).forEach((seriesData, idx) => {
          seriesData.push(idx ? val : val2);
        });

        Object.values(chartData2.data).forEach((seriesData, idx) => {
          seriesData.push(idx ? val3 : val4);
        });
      } else {
        Object.values(chartData.data).forEach((seriesData, idx) => {
          seriesData.push(null);
        });

        Object.values(chartData2.data).forEach((seriesData, idx) => {
          seriesData.push(null);
        });
      }
    };

    onMounted(() => {
      for (let ix = 0; ix < 10; ix++) {
        addRandomChartData(ix);
      }
    });

    return {
      chartData,
      chartData2,
      chartOptions,
      clickedLabel,
      brushOptions,
      chartGroupOptions,
      defaultGroupSelectLabel,
      zoomStartIdx,
      zoomEndIdx,
      onClick,
    };
  },
};
</script>

<style lang="scss">
</style>
