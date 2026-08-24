<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" @drag-select="onDragSelect" />
    </resizable-wrapper>
  </div>
  <div class="description">
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
      bar 와 line 이 함께 담긴다({{ selectionItems.length }} 시리즈). bar 는 x 구간이 걸치기만
      해도 담기고 line 은 점이 구간 안에 들어야 담기므로, 같은 드래그에서 건수가 다를 수 있다.
    </p>
    <div v-for="series in selectionItems" :key="series.seriesId">
      <b>{{ series.seriesName }}</b> — {{ series.items.length }}건
      <span v-if="series.items.length">
        ({{ convertToDateString(series.items[0].x) }} ~
        {{ convertToDateString(series.items[series.items.length - 1].x) }})
      </span>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
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
        series1: { name: 'bar#1', show: true, type: 'bar' },
        series2: { name: 'line#1', show: true, type: 'line', combo: true },
      },
      labels,
      data: {
        series1,
        series2,
      },
    });

    // 콤보는 options.type 을 두지 않고 시리즈가 각자 type 을 선언한다.
    const chartOptions = {
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
