<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" @drag-select="onDragSelect" />
    </resizable-wrapper>
  </div>
  <div class="description">
    <div class="badge yellow">누적(stack)</div>
    <ev-toggle v-model="useStack" />
    <br /><br />
    <div class="badge yellow">범위 값</div>
    <br /><br />
    <div v-if="selectionRange.xMin">
      <p>X min : {{ convertToDateString(selectionRange.xMin) }}</p>
      <p>X max : {{ convertToDateString(selectionRange.xMax) }}</p>
      <p>Y min : {{ selectionRange.yMin }}</p>
      <p>Y max : {{ selectionRange.yMax }}</p>
    </div>
    <br />
    <div class="badge yellow">선택 영역 내 데이터</div>
    <br /><br />
    <p>
      바 시리즈는 <i>data</i> 에 담기지 않는다({{ selectionItems.length }}건). 범위는 위 range 로
      판단한다.
    </p>
  </div>
</template>

<script>
import { reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const startTime = dayjs().startOf('hour').subtract(23, 'hour');
    const labels = [];
    const series1 = [];
    const series2 = [];

    for (let ix = 0; ix < 24; ix++) {
      labels.push(startTime.add(ix, 'hour'));
      series1.push(Math.floor(Math.random() * 100) + 10);
      series2.push(Math.floor(Math.random() * 100) + 10);
    }

    const chartData = reactive({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      groups: [],
      labels,
      data: {
        series1,
        series2,
      },
    });

    // 누적은 차트 타입이 아니라 groups 로 표현되므로, 드래그 진입 조건은 일반 막대와 같다.
    const useStack = ref(false);
    watch(useStack, (use) => {
      chartData.groups = use ? [['series1', 'series2']] : [];
    });

    const chartOptions = {
      type: 'bar',
      width: '100%',
      thickness: 0.8,
      title: {
        text: 'Chart Title',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      horizontal: false,
      axesX: [
        {
          type: 'time',
          categoryMode: true,
          showGrid: false,
          timeFormat: 'HH:mm',
          interval: 'hour',
        },
      ],
      axesY: [
        {
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
          showGrid: true,
        },
      ],
      dragSelection: {
        use: true,
        keepDisplay: true,
      },
    };

    const selectionItems = ref([]);
    const selectionRange = ref({});
    const onDragSelect = ({ data, range }) => {
      selectionItems.value = data;
      selectionRange.value = range;
    };

    const convertToDateString = (value) => dayjs(value).format('MM/DD HH:mm');

    return {
      chartData,
      chartOptions,
      useStack,
      selectionItems,
      selectionRange,
      onDragSelect,
      convertToDateString,
    };
  },
};
</script>

<style lang="scss" scoped>
.description {
  span {
    margin-right: 15px;
  }
}
</style>
