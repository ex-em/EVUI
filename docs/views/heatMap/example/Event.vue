<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
      @drag-select="onDragSelect"
      @click="onClick"
      @dbl-click="onDblClick"
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
      <div class="one-row">
        <p class="badge yellow">
          클릭 정보
        </p>
        <div v-if="clickedInfo">
          <p><b>label</b> : {{ clickedInfo.label }} </p>
          <p><b>value</b> : {{ clickedInfo.value }} </p>
          <p><b>series ID</b> : {{ clickedInfo.sId }} </p>
        </div>
      </div>
      <div class="one-row">
        <p class="badge yellow">
          더블 클릭 정보
        </p>
        <div v-if="dblClickedInfo">
          <p><b>label</b> : {{ dblClickedInfo.label }} </p>
          <p><b>value</b> : {{ dblClickedInfo.value }} </p>
          <p><b>series ID</b> : {{ dblClickedInfo.sId }} </p>
        </div>
      </div>
  </div>
</div></template>

<script>
import { onMounted, reactive, ref } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const currentTime = dayjs();
      const chartData = reactive({
        series: {
          series1: {
            name: 'series#1',
            colorOpt: {
              min: '#B3E148',
              max: '#6B9900',
              categoryCnt: 5,
              border: '#242426',
              error: '#FF5A5A',
            },
            spaces: {
              x: 60,
              y: 20,
            },
          },
        },
        data: {
          series1: [],
        },
      });


      const chartOptions = {
        type: 'heatMap',
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
          interval: 2,
        }],
        selectItem: {
          use: true,
        },
        legend: {
          position: 'right',
        },
        tooltip: {
          use: true,
        },
      };

      const selectionItems = ref([]);
      const selectionRange = ref({});

      const onDragSelect = ({ data, range }) => {
        selectionItems.value = data;
        selectionRange.value = range;
      };


      const dblClickedInfo = ref(null);
      const onDblClick = ({ e, label, value, sId }) => {
        dblClickedInfo.value = { e, label, value, sId };
      };

      const clickedInfo = ref(null);
      const onClick = ({ e, label, value, sId }) => {
        clickedInfo.value = { e, label, value, sId };

        // Clear drag selection info
        selectionItems.value = [];
        selectionRange.value = {};
      };

      const getDateString = x => dayjs(x).format('HH:mm:ss');

      const addRandomChartData = () => {
        const seriesData = chartData.data.series1;
        const seriesSpaces = chartData.series.series1.spaces;
        const timeValue = currentTime.add(Math.floor(Math.random() * seriesSpaces.x), 'second');
        const maxRandomValue = seriesSpaces.y * 2;
        let randomValue = Math.floor((Math.random() * maxRandomValue)) + 2;
        randomValue = randomValue % 2 === 0 ? randomValue : randomValue - 1;
        const randomCount = Math.floor(Math.random() * 5000);
        const item = { x: timeValue, y: randomValue, count: randomCount };
        if (!seriesData.find(({ x, y }) => x === timeValue && y === randomValue)) {
          seriesData.push(item);
        }
      };

      const addRandomErrorData = () => {
        const seriesData = chartData.data.series1;
        const seriesSpaces = chartData.series.series1.spaces;
        const timeValue = currentTime.add(Math.floor(Math.random() * seriesSpaces.x), 'second');
        const maxRandomValue = seriesSpaces.y * 2;
        let randomValue = Math.floor((Math.random() * maxRandomValue)) + 2;
        randomValue = randomValue % 2 === 0 ? randomValue : randomValue - 1;
        const index = seriesData.findIndex(({ x, y }) => x === timeValue && y === randomValue);
        const item = {
          x: timeValue,
          y: randomValue,
          count: -1,
        };
        if (index > -1) {
          seriesData.splice(index, 1, item);
        } else {
          seriesData.push(item);
        }
      };

      onMounted(() => {
        for (let ix = 0; ix < 450; ix++) {
          addRandomChartData();
        }
        for (let ix = 0; ix < 50; ix++) {
          addRandomErrorData();
        }
      });

      return {
        chartData,
        chartOptions,
        selectionItems,
        selectionRange,
        dblClickedInfo,
        clickedInfo,
        onDragSelect,
        onDblClick,
        onClick,
        getDateString,
      };
    },
  };
</script>
