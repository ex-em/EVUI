<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" @drag-select="onDragSelect" />
    </resizable-wrapper>
  </div>
  <div class="description">
    <div class="badge yellow">마지막 선택 구간</div>
    <br /><br />
    <p v-if="selectedRange">{{ selectedRange }}</p>
    <p v-else>차트를 드래그해 보세요. 드래그하는 동안 툴팁 헤더에 시작 ~ 현재 구간이 표시됩니다.</p>
  </div>
</template>

<script>
import { ref } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const time = dayjs().format('YYYY-MM-DD');
    const labels = Array.from({ length: 24 }, (_, i) => dayjs(time).add(i, 'hour'));

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

    const formatTime = (value) => dayjs(value).format('DD HH:mm');

    const chartOptions = {
      type: 'line',
      width: '100%',
      legend: { show: true, position: 'right' },
      axesX: [{ type: 'time', showGrid: true, timeFormat: 'HH:mm', interval: 'hour' }],
      axesY: [{ type: 'linear', showGrid: true, startToZero: true }],
      dragSelection: {
        use: true,
        keepDisplay: false,
      },
      tooltip: {
        use: true,
        formatter: {
          // 드래그 중에만 2번째 인자로 { dragRange } 가 전달된다.
          html: (seriesList, meta) => {
            const header = meta?.dragRange
              ? `${formatTime(meta.dragRange.fromLabel)} ~ ${formatTime(meta.dragRange.toLabel)}`
              : formatTime(seriesList[0]?.data?.x);
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

    const selectedRange = ref('');
    const onDragSelect = ({ range }) => {
      selectedRange.value = `${formatTime(range.xMin)} ~ ${formatTime(range.xMax)}`;
    };

    return {
      chartData,
      chartOptions,
      selectedRange,
      onDragSelect,
    };
  },
};
</script>
