<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
      @drag-select="onDragSelect"
    />
    <div class="description">
      <div class="badge yellow"> 선택 영역 내 데이터 </div>
      <br><br>
      <div
        v-for="(row, rowIndex) in selectionItems"
        :key="rowIndex"
      >
        <span> Series Name : {{ row.seriesName }} </span>
        <br>
        <div
          v-for="(item, itemIndex) in row.items"
          :key="itemIndex"
        >
          <span>x : {{ convertToDateString(item.x) }}</span>
          <span>y : {{ item.y }}</span>
        </div>
        <br><br>
      </div>
      <div class="badge yellow"> 범위 값 </div>
      <br><br>
      <div v-if="selectionRange.xMin">
        <p> X min : {{ convertToDateString(selectionRange.xMin) }} </p>
        <p> X max : {{ convertToDateString(selectionRange.xMax) }} </p>
        <p> Y min : {{ selectionRange.yMin }} </p>
        <p> Y max : {{ selectionRange.yMax }} </p>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const time = dayjs().format('YYYY-MM-DD');
      const chartData = {
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
      };

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
        axesX: [{
          type: 'time',
          showGrid: true,
          timeFormat: 'MM/DD',
          interval: 'day',
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        }],
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

      const convertToDateString = value => dayjs(value).format('MM/DD');

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
