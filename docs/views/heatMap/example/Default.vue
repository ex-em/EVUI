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
import { ref } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const chartData = {
    series: {
        series1: {
            name: 'series1',
            highlight: {
                stroke: {
                    use: true,
                    color: '#FFFFFF',
                    width: 5,
                    radius: 2,
                },
                shadow: {
                    use: false,
                },
            },
        },
    },
    labels: {
        x: [
            1756710930000,
            1756710935000,
            1756710940000,
            1756710945000,
            1756710950000,
            1756710955000,
            1756710960000,
            1756710965000,
            1756710970000,
            1756710975000,
            1756710980000,
        ],
        y: [
            0,
            100,
            200,
            300,
        ],
    },
    data: {
        series1: [
            {
                x: 1756710930000,
                y: 0,
                value: 1,
                color: '#ff85f7',
            },
            {
                x: 1756710930000,
                y: 100,
                value: null,
                color: '',
            },
            {
                x: 1756710930000,
                y: 200,
                value: null,
                color: '',
            },
            {
                x: 1756710930000,
                y: 300,
                value: null,
                color: '',
            },
            {
                x: 1756710935000,
                y: 0,
                value: 1,
                color: '#ff85f7',
            },
            {
                x: 1756710935000,
                y: 100,
                value: null,
                color: '',
            },
            {
                x: 1756710935000,
                y: 200,
                value: null,
                color: '',
            },
            {
                x: 1756710935000,
                y: 300,
                value: null,
                color: '',
            },
            {
                x: 1756710940000,
                y: 0,
                value: 1,
                color: '#ff85f7',
            },
            {
                x: 1756710940000,
                y: 100,
                value: null,
                color: '',
            },
            {
                x: 1756710940000,
                y: 200,
                value: null,
                color: '',
            },
            {
                x: 1756710940000,
                y: 300,
                value: null,
                color: '',
            },
            {
                x: 1756710945000,
                y: 0,
                value: 1,
                color: '#ff85f7',
            },
            {
                x: 1756710945000,
                y: 100,
                value: null,
                color: '',
            },
            {
                x: 1756710945000,
                y: 200,
                value: null,
                color: '',
            },
            {
                x: 1756710945000,
                y: 300,
                value: null,
                color: '',
            },
            {
                x: 1756710950000,
                y: 0,
                value: 1,
                color: '#ff85f7',
            },
            {
                x: 1756710950000,
                y: 100,
                value: null,
                color: '',
            },
            {
                x: 1756710950000,
                y: 200,
                value: null,
                color: '',
            },
            {
                x: 1756710950000,
                y: 300,
                value: null,
                color: '',
            },
            {
                x: 1756710955000,
                y: 0,
                value: 1,
                color: '#ff85f7',
            },
            {
                x: 1756710955000,
                y: 100,
                value: null,
                color: '',
            },
            {
                x: 1756710955000,
                y: 200,
                value: 1,
                color: '#ff85f7',
            },
            {
                x: 1756710955000,
                y: 300,
                value: null,
                color: '',
            },
            {
                x: 1756710960000,
                y: 0,
                value: 1,
                color: '#ff85f7',
            },
            {
                x: 1756710960000,
                y: 100,
                value: null,
                color: '',
            },
            {
                x: 1756710960000,
                y: 200,
                value: null,
                color: '',
            },
            {
                x: 1756710960000,
                y: 300,
                value: null,
                color: '',
            },
            {
                x: 1756710965000,
                y: 0,
                value: 1,
                color: '#ff85f7',
            },
            {
                x: 1756710965000,
                y: 100,
                value: null,
                color: '',
            },
            {
                x: 1756710965000,
                y: 200,
                value: null,
                color: '',
            },
            {
                x: 1756710965000,
                y: 300,
                value: null,
                color: '',
            },
            {
                x: 1756710970000,
                y: 0,
                value: 1,
                color: '#ff85f7',
            },
            {
                x: 1756710970000,
                y: 100,
                value: null,
                color: '',
            },
            {
                x: 1756710970000,
                y: 200,
                value: null,
                color: '',
            },
            {
                x: 1756710970000,
                y: 300,
                value: null,
                color: '',
            },
            {
                x: 1756710975000,
                y: 0,
                value: 1,
                color: '#ff85f7',
            },
            {
                x: 1756710975000,
                y: 100,
                value: null,
                color: '',
            },
            {
                x: 1756710975000,
                y: 200,
                value: null,
                color: '',
            },
            {
                x: 1756710975000,
                y: 300,
                value: null,
                color: '',
            },
            {
                x: 1756710980000,
                y: 0,
                value: 1,
                color: '#ff85f7',
            },
            {
                x: 1756710980000,
                y: 100,
                value: null,
                color: '',
            },
            {
                x: 1756710980000,
                y: 200,
                value: null,
                color: '',
            },
            {
                x: 1756710980000,
                y: 300,
                value: null,
                color: '',
            },
        ],
    },
    groups: [],
};


      const chartOptions = {
    type: 'heatMap',
    width: '100%',
    title: {
        show: false,
    },
    indicator: {
        use: false,
    },
    dragSelection: {
        fillColor: '#41A2FF',
        opacity: 0.2,
        use: true,
        keepDisplay: true,
    },
    padding: {
        top: 0,
        right: 0,
        bottom: 10,
    },
    axesX: [
        {
            axisLineColor: '#D8DBDE',
            gridLineColor: '#D8DBDE',
            labelStyle: {
                fitWidth: true,
                alignToGridLine: false,
            },
            timeFormat: 'HH:mm:ss',
            interval: {
                unit: 'second',
                time: 5,
            },
            type: 'time',
            categoryMode: true,
            showGrid: false,
        },
    ],
    axesY: [
        {
            axisLineColor: '#D8DBDE',
            gridLineColor: '#D8DBDE',
            labelStyle: {
                alignToGridLine: true,
            },
            type: 'step',
            showGrid: true,
        },
    ],
    selectItem: {
        use: true,
    },
    heatMapColor: {
        min: '#FFFFFF',
        max: '#FFFFFF',
        rangeCount: 3,
        stroke: {
            color: '#FFFFFF',
            lineWidth: 8,
            radius: 1,
            show: false,
        },
    },
    legend: {
        show: false,
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
