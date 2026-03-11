<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart
        v-model:selectedLabel="defaultSelectLabel"
        :data="chartData"
        :options="chartOptions"
        @click="onClick"
        @dbl-click="onDblClick"
      />
    </resizable-wrapper>
  </div>
  <div class="description">
    <div class="badge yellow">기본 선택값 v-model</div>
    {{ defaultSelectLabel }}
    <br /><br />
    <div class="badge yellow">클릭된 라벨</div>
    {{ clickedLabel }}
    <br /><br />
    <div class="badge yellow">더블 클릭된 라벨</div>
    {{ dblClickedLabel }}
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
        series1: [null, null, null, null, null, null, null],
        series2: [80, 36, null, null, 15, null, null],
      },
    });

    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      tooltip: {
        use: true,
        // nearest: 'none',
      },
      title: {
        text: 'Chart Title',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'time',
          showGrid: false,
          timeFormat: 'YYYY-MM-DD',
          interval: 'day',
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.3,
        },
      ],
      selectLabel: {
        use: true,
        showTextTip: true,
        tipText: 'label',
        fixedPosTop: true,
        showIndicator: true,
        useDeselectOverflow: true,
        useLabelOpacity: false,
        useSeriesOpacity: false,
        limit: 1,
      },
      maxTip: {
        use: true,
        tipStyle: {
          background: '#FF00FF',
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

    const defaultSelectLabel = ref({
      dataIndex: [3],
    });

    return {
      chartData,
      chartOptions,
      clickedLabel,
      dblClickedLabel,
      defaultSelectLabel,
      onClick,
      onDblClick,
    };
  },
};
</script>

<style lang="scss"></style>
