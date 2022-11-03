<template>
  <div class="case">
    <ev-chart-group :options="brushOptions">
      <ev-chart
        v-model:selectedItem="defaultSelectItem"
        :data="chartData"
        :options="chartOptions"
        @click="onClick"
        @dbl-click="onDblClick"
      />
      <ev-chart-brush/>
    </ev-chart-group>
    <div class="description">
      <div class="badge yellow">
        기본 선택값 v-model
      </div>
      {{ defaultSelectItem }}
      <br><br>
      <div class="badge yellow">
        클릭된 라벨
      </div>
      {{ clickedLabel }}
      <br><br>
      <div class="badge yellow">
        더블 클릭된 라벨
      </div>
      {{ dblClickedLabel }}
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const time = dayjs().format('YYYY-MM-DD');
    const chartData = reactive({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      labels: [
        dayjs(time),
        dayjs(time).add(1, 'day'),
        dayjs(time).add(2, 'day'),
        dayjs(time).add(3, 'day'),
        dayjs(time).add(4, 'day'),
        dayjs(time).add(5, 'day'),
        dayjs(time).add(6, 'day'),
      ],
      data: {
        series1: [100, 25, 36, 47, 0, 50, 80],
        series2: [80, 36, 25, 47, 15, 100, 0],
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
      selectItem: {
        use: true,
        showTextTip: true,
        tipText: 'label',
        fixedPosTop: true,
        showIndicator: true,
      },
      maxTip: {
        use: true,
        tipStyle: {
          background: '#FF00FF',
        },
      },
    });

    const brushOptions = reactive({
      zoom: {
        toolbar: {
          show: true,
        },
      },
    });

    const clickedLabel = ref("''");
    const onClick = (target) => {
      clickedLabel.value = dayjs(target.label).format('YYYY-MM-DD');
    };

    const dblClickedLabel = ref("''");
    const onDblClick = (target) => {
      dblClickedLabel.value = dayjs(target.label).format('YYYY-MM-DD');
    };

    const defaultSelectItem = ref({
      seriesID: '',
      dataIndex: null,
    });

    return {
      chartData,
      chartOptions,
      brushOptions,
      clickedLabel,
      dblClickedLabel,
      defaultSelectItem,
      onClick,
      onDblClick,
    };
  },
};
</script>

<style lang="scss">
</style>
