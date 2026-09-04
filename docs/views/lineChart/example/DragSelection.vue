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
    const chartData = {
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      labels,
      data: {
        series1: labels.map((_, i) => Math.round(50 + Math.sin(i / 2) * 40)),
        series2: labels.map((_, i) => Math.round(50 + Math.cos(i / 3) * 30)),
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
      },
      tooltip: {
        use: true,
        formatter: {
          // 드래그 중에만 2번째 인자로 { dragRange } 가 전달된다.
          html: (seriesList, meta) => {
            const header = meta?.dragRange
              ? `${convertToDateString(meta.dragRange.fromLabel)} ~ ` +
                `${convertToDateString(meta.dragRange.toLabel)}`
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
