<template>
  <div class="case">
    <ev-chart-group
      v-model:zoomStartIdx='zoomStartIdx'
      v-model:zoomEndIdx='zoomEndIdx'
      :options="chartGroupOptions"
    >
      <ev-chart
        v-model:selectedLabel="defaultSelectLabel"
        :data="chartData"
        :options="chartOptions"
        @click="onClick"
      />
      <ev-chart
        v-model:selectedLabel="defaultSelectLabel2"
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
      {{ defaultSelectLabel }}
      {{ defaultSelectLabel2 }}
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
        series1: { name: 'DB CPU' },
        series2: { name: 'DB Time' },
      },
      labels: [],
      data: {
        series1: [],
        series2: [],
      },
    });
    const chartOptions = reactive({
      type: 'line',
      width: '100%',
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
        showGrid: false,
        timeFormat: 'YYYY-MM-DD',
        interval: 'day',
      }],
      axesY: [{
        type: 'linear',
        showGrid: true,
        startToZero: true,
        autoScaleRatio: 0.3,
      }],
      maxTip: {
        use: true,
        tipStyle: {
          background: '#FF00FF',
        },
      },
      selectLabel: {
        use: true,
        useClick: true,
        limit: 3,
        useDeselectOverflow: true,
        useApproximateValue: true,
        tipBackground: '#FF0000',
        useSeriesOpacity: false,
        useLabelOpacity: false,
        showTextTip: true,
        fixedPosTop: true,
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

    const defaultSelectLabel = ref({
      dataIndex: [4, 6],
    });

    const defaultSelectLabel2 = ref({
      dataIndex: [1],
    });

    const clickedLabel = ref("''");
    const onClick = (target) => {
      clickedLabel.value = target.selected.label.map(label => dayjs(label).format('YYYY-MM-DD'));
    };

    const addRandomChartData = () => {
      timeValue = dayjs(timeValue).add(1, 'day');
      const date = dayjs(timeValue);

      chartData.labels.push(date);
      chartData2.labels.push(date);

      const val = Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      const val2 = Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      const val3 = Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;
      const val4 = Math.floor(Math.random() * ((5000 - 5) + 1)) + 5;

      Object.values(chartData.data).forEach((seriesData, idx) => {
        seriesData.push(idx ? val : val2);
      });

      Object.values(chartData2.data).forEach((seriesData, idx) => {
        seriesData.push(idx ? val3 : val4);
      });
    };

    onMounted(() => {
      for (let ix = 0; ix < 10; ix++) {
        addRandomChartData();
      }
    });

    return {
      chartData,
      chartData2,
      chartOptions,
      clickedLabel,
      brushOptions,
      chartGroupOptions,
      defaultSelectLabel,
      defaultSelectLabel2,
      zoomStartIdx,
      zoomEndIdx,
      onClick,
    };
  },
};
</script>
