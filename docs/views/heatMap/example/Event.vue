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
      <span class="toggle-label">데이터 자동 업데이트</span>
      <ev-toggle
        v-model="isLive"
      />
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
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const chartData = reactive({
        series: {
          series1: {
            name: 'series#1',
            colorOpt: {
              min: '#B3E148',
              max: '#6B9900',
              categoryCnt: 5,
              border: '#FFFFFF',
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
        }],
        selectItem: {
          use: true,
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

      const isLive = ref(false);
      const liveInterval = ref();
      let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

      const addRandomChartData = () => {
        const seriesData = chartData.data.series1;
        const seriesSpaces = chartData.series.series1.spaces;
        const maxRandomValue = seriesSpaces.y * 2;

        timeValue = dayjs(timeValue).add(1, 'second');

        if (isLive.value) {
          const spliceTimeValue = seriesData[0].x;
          const spliceData = seriesData.filter(({ x }) =>
              new Date(x).getTime() === new Date(spliceTimeValue).getTime());
          seriesData.splice(0, spliceData.length);
        }

        for (let iy = 0; iy < 15; iy++) {
          let randomValue = Math.floor(Math.random() * maxRandomValue) + 2;
          randomValue = randomValue % 2 === 0 ? randomValue : randomValue - 1;
          let randomCount = Math.floor(Math.random() * 5000);
          if (randomCount > 4500) {
            randomCount = -1;
          }
          const item = {
            x: timeValue,
            y: randomValue,
            value: randomCount,
          };
          // eslint-disable-next-line no-loop-func
          const targetIndex = seriesData.findIndex(({ x, y }) =>
              new Date(x).getTime() === new Date(timeValue).getTime() && y === randomValue);
          if (targetIndex === -1) {
            seriesData.push(item);
          }
        }
      };

      onMounted(() => {
        for (let ix = 0; ix < 60; ix++) {
          addRandomChartData();
        }
      });

      watch(isLive, (newValue) => {
        if (newValue) {
          addRandomChartData();
          liveInterval.value = setInterval(addRandomChartData, 1000);
        } else {
          clearInterval(liveInterval.value);
        }
      });

      onBeforeUnmount(() => {
        clearInterval(liveInterval.value);
      });

      return {
        chartData,
        chartOptions,
        selectionItems,
        selectionRange,
        dblClickedInfo,
        clickedInfo,
        isLive,
        onDragSelect,
        onDblClick,
        onClick,
        getDateString,
      };
    },
  };
</script>
