<template>
  <div class="case">
    <ev-chart
      v-model:selectedLabel="clickedSelectLabel"
      :data="chartData"
      :options="chartOptions"
      @drag-select="onDragSelect"
      @click="onClick"
      @dbl-click="onDblClick"
    />
    <div class="description">
      <div class="one-row">
        <p class="badge yellow">label 클릭 여부</p>
        <ev-toggle
          v-model="useSelectLabel"
        />
        <div v-if="useSelectLabel">
          {{ clickedSelectLabel }}
        </div>
      </div>
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
          <p><b>label[x]</b> : {{ clickedInfo.label }} </p>
          <p><b>label[y]</b> : {{ clickedInfo.acc }} </p>
          <p><b>value</b> : {{ clickedInfo.value }} </p>
        </div>
      </div>
      <div class="one-row">
        <p class="badge yellow">
          더블 클릭 정보
        </p>
        <div v-if="dblClickedInfo">
          <p><b>label[x]</b> : {{ dblClickedInfo.label }} </p>
          <p><b>label[y]</b> : {{ dblClickedInfo.acc }} </p>
          <p><b>value</b> : {{ dblClickedInfo.value }} </p>
        </div>
      </div>
  </div>
</div></template>

<script>
import { onMounted, reactive, ref, watch } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const useSelectLabel = ref(false);

      const chartData = reactive({
        series: {
          series1: {
            name: 'series#1',
          },
        },
        labels: {
          x: [],
          y: [],
        },
        data: {
          series1: [],
        },
      });


      const chartOptions = reactive({
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
          categoryMode: true,
          showGrid: false,
        }],
        axesY: [{
          type: 'step',
          showGrid: false,
        }],
        selectItem: {
          use: true,
        },
        selectLabel: {
          use: true,
          useClick: useSelectLabel.value,
          useApproximateValue: true,
        },
        heatMapColor: {
          min: '#A1CDF9',
          max: '#336fe9',
          rangeCount: 3,
          error: '#F9E469',
          stroke: {
            show: true,
          },
        },
        tooltip: {
          use: true,
        },
      });

      const selectionItems = ref([]);
      const selectionRange = ref({});
      const clickedSelectLabel = ref({
        dataIndex: [],
      });

      const onDragSelect = ({ data, range }) => {
        selectionItems.value = data;
        selectionRange.value = range;
      };

      const dblClickedInfo = ref(null);
      const onDblClick = ({ e, label, value, sId, acc }) => {
        dblClickedInfo.value = { e, label, value, sId, acc };
      };

      const clickedInfo = ref(null);
      const onClick = ({ e, label, value, sId, acc }) => {
        clickedInfo.value = { e, label, value, sId, acc };

        // Clear drag selection info
        selectionItems.value = [];
        selectionRange.value = {};
      };

      const getDateString = x => dayjs(x).format('HH:mm:ss');

      let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

      const addRandomChartData = () => {
        const seriesData = chartData.data.series1;

        timeValue = dayjs(timeValue).add(1, 'second');
        chartData.labels.x.push(timeValue);

        for (let iv = 0; iv <= 10; iv++) {
          const yRandomIndex = Math.floor(Math.random() * 5);
          const yValue = chartData.labels.y[yRandomIndex];
          let randomValue = Math.floor(Math.random() * 5000) + 1;
          if (randomValue > 4500) {
            randomValue = -1;
          }

          const item = {
            x: timeValue,
            y: yValue,
            value: randomValue,
          };
          // eslint-disable-next-line no-loop-func
          const targetIndex = seriesData.findIndex(({ x, y }) =>
              new Date(x).getTime() === new Date(timeValue).getTime() && y === yValue);
          if (targetIndex === -1) {
            seriesData.push(item);
          }
        }
      };

      onMounted(() => {
        for (let iy = 2; iy <= 10; iy += 2) {
          chartData.labels.y.push(iy);
        }

        for (let ix = 0; ix < 30; ix++) {
          addRandomChartData();
        }
      });

      watch(useSelectLabel, (newValue) => {
        clickedSelectLabel.value.dataIndex = [];
        chartOptions.selectLabel.useClick = newValue;
      });

      return {
        useSelectLabel,
        chartData,
        chartOptions,
        selectionItems,
        selectionRange,
        clickedSelectLabel,
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
