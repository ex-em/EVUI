<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" @drag-select="onDragSelect" />
    </resizable-wrapper>
  </div>
  <div class="description">
    <div class="badge yellow">선택 영역 내 데이터</div>
    <br /><br />
    <div v-for="(row, rowIndex) in selectionItems" :key="rowIndex">
      <span> Series Name : {{ row.seriesName }} </span>
      <br />
      <div v-for="(item, itemIndex) in row.items" :key="itemIndex">
        <span>x : {{ convertToDateString(item.x) }}</span>
        <span>y : {{ item.y }}</span>
      </div>
      <br /><br />
    </div>
    <div class="badge yellow">범위 값</div>
    <br /><br />
    <div v-if="selectionRange.xMin">
      <p>X min : {{ convertToDateString(selectionRange.xMin) }}</p>
      <p>X max : {{ convertToDateString(selectionRange.xMax) }}</p>
      <p>Y min : {{ selectionRange.yMin }}</p>
      <p>Y max : {{ selectionRange.yMax }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const time = dayjs().startOf('hour');
    const labels = Array.from({ length: 25 }, (_, i) => time.add(i * 10, 'second'));
    // 값이 비어 있는 구간. 드래그가 여기를 지나면 hover hit 이 0개라 툴팁이 사라진다 —
    // showTooltipOnEmpty 로 구간 헤더만 남는 동작을 확인할 수 있다.
    const isGap = (i) => i >= 10 && i <= 13;
    const chartData = {
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      labels,
      data: {
        series1: labels.map((_, i) => (isGap(i) ? null : Math.round(50 + Math.sin(i / 2) * 40))),
        series2: labels.map((_, i) => (isGap(i) ? null : Math.round(50 + Math.cos(i / 3) * 30))),
      },
    };

    const convertToDateString = (value) => dayjs(value).format('MM/DD HH:mm:ss');

    const chartOptions = {
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
      axesX: [
        {
          type: 'time',
          showGrid: true,
          timeFormat: 'mm:ss',
          interval: { time: 30, unit: 'second' },
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        },
      ],
      dragSelection: {
        use: true,
        keepDisplay: true,
        // 데이터가 없는 지점을 지나도 드래그 구간 헤더는 계속 보이게 한다.
        showTooltipOnEmpty: true,
      },
      tooltip: {
        use: true,
        formatter: {
          // 드래그 중에만 2번째 인자로 { dragRange } 가 전달된다.
          html: (seriesList, meta) => {
            const header = meta?.dragRange
              ? `${convertToDateString(meta.dragRange.from)} ~ ` +
                `${convertToDateString(meta.dragRange.to)}`
              : convertToDateString(seriesList[0]?.data?.x);
            const rows = seriesList
              .map(
                ({ name, color, data }) =>
                  `<div data-evui-tooltip-row>
                     <span style="color:${color}">■</span> ${name} : ${data.y}
                   </div>`,
              )
              .join('');

            return `<div class="ev-chart-tooltip-custom">
                      <div class="ev-chart-tooltip-custom__header">${header}</div>
                      <div class="ev-chart-tooltip-custom__body">${rows}</div>
                    </div>`;
          },
        },
      },
    };

    const selectionItems = ref([]);
    const selectionRange = ref({});
    const onDragSelect = ({ data, range }) => {
      selectionItems.value = data;
      selectionRange.value = range;
    };

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
