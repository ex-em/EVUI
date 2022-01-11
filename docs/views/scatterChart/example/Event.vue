<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
      @drag-select="onDragSelect"
    />
    <div class="description">
      <div class="one-row">
        <p class="badge yellow">
          선택 영역 내 데이터
        </p>
        <div
            v-for="(row, rowIndex) in selectionItems"
            :key="rowIndex"
        >
          <i>{{ row.seriesName }}</i>
          <p v-for="(item, itemIdx) in row.items"
             :key="itemIdx"
          >
            <b>x</b>: {{ getDateString(item.x) }} <b>y</b>: {{ item.y }}
          </p>
          <br><br>
        </div>
      </div>
      <div class="one-row">
        <p class="badge yellow">
          범위 값
        </p>
        <div v-if="selectionRange.xMin">
          <p><b>X min</b> : {{ getDateString(selectionRange.xMin) }} </p>
          <p><b>X max</b> : {{ getDateString(selectionRange.xMax) }} </p>
          <p><b>Y min</b> : {{ selectionRange.yMin }} </p>
          <p><b>Y max</b> : {{ selectionRange.yMax }} </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const currentTime = dayjs();

      const chartData = {
        series: {
          series1: { name: 'series#1' },
          series2: { name: 'series#2' },
          series3: { name: 'series#2' },
        },
        data: {
          series1: [
            { x: currentTime, y: 1 },
            { x: currentTime.add(1, 'second'), y: 20 },
            { x: currentTime.add(1, 'second'), y: 30 },
            { x: currentTime.add(2, 'second'), y: 10 },
          ],
          series2: [
            { x: currentTime, y: 20 },
            { x: currentTime.add(2, 'second'), y: 20 },
            { x: currentTime.add(3, 'second'), y: 13 },
            { x: currentTime.add(4, 'second'), y: 1 },
          ],
          series3: [
            { x: currentTime, y: 30 },
            { x: currentTime.add(2, 'second'), y: 5 },
            { x: currentTime.add(3, 'second'), y: 23 },
            { x: currentTime.add(4, 'second'), y: 40 },
            { x: currentTime.add(4, 'second'), y: 20 },
          ],
        },
      };

      const chartOptions = {
        type: 'scatter',
        width: '100%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        indicator: {
          use: false,
        },
        dragSelection: {
          use: true,
          keepDisplay: true,
        },
        axesX: [{
          type: 'time',
          timeFormat: 'HH:mm:ss',
          interval: 'second',
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
        }],
      };

      const selectionItems = ref([]);
      const selectionRange = ref({});

      const onDragSelect = ({ data, range }) => {
        selectionItems.value = data;
        selectionRange.value = range;
      };

      const getDateString = x => dayjs(x).format('HH:mm:ss');

      return {
        chartData,
        chartOptions,
        selectionItems,
        selectionRange,
        onDragSelect,
        getDateString,
      };
    },
  };
</script>

<style lang="scss" scoped>
.description-label {
  vertical-align: top;
  margin-right: 3px;
}

.one-row {
  width: 100%;
  margin: 15px 0 15px 0;

  p {
    margin-top: 3px;
  }
}
</style>
