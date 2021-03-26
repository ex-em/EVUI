<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
      @drag-select="onDragSelect"
    />
    <div class="description">
      <span class="description-label">
        데이터 자동 업데이트
      </span>
      <ev-toggle v-model="isLive"/>
      <br><br>
      <div class="badge yellow">
        선택 영역 내 데이터
      </div>
      <br><br>
      <div
        v-for="(row, rowIndex) in selectionItems"
        :key="rowIndex"
      >
        Series Name : {{ row.seriesName }}
        <br>
        Items : {{ row.items }}
        <br><br>
      </div>
      <div class="badge yellow">
        범위 값
      </div>
      <br><br>
      <div v-if="selectionRange.xMin">
        X min : {{ selectionRange.xMin }} <br>
        X max : {{ selectionRange.xMax }} <br>
        Y min : {{ selectionRange.yMin }} <br>
        Y max : {{ selectionRange.yMax }} <br>
      </div>
    </div>
  </div>
</template>

<script>
  import { watch, ref, onBeforeUnmount, onMounted, reactive } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const pointSize = 3;
      const pointStyle = 'circle';
      const seriesCount = 3;
      const xAxisDataCount = 10;

      const chartData = reactive({
        series: {},
        labels: [],
        data: {},
      });

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

      const isLive = ref(false);
      const liveInterval = ref();
      let timeValue = +dayjs();

      const addRandomChartData = () => {
        timeValue = +dayjs(timeValue).add(1, 'second');
        chartData.labels.shift();
        chartData.labels.push(timeValue);

        Object.values(chartData.data).forEach((seriesData) => {
          seriesData.shift();
          seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
        });
      };

      const initChartSeries = () => {
        chartData.series = {};
        chartData.labels.length = 0;
        chartData.data = {};

        let seriesName;
        let seriesId;
        for (let ix = 1; ix <= seriesCount; ix++) {
          seriesName = `series#${ix}`;
          seriesId = `series${ix}`;
          chartData.series[seriesId] = {
            name: seriesName,
            pointSize,
            pointStyle,
          };

          chartData.data[seriesId] = [];
        }
      };

      const initChartData = () => {
        const dataKeys = Object.keys(chartData.data);
        chartData.labels.length = 0;
        for (let ix = 0; ix < dataKeys.length; ix++) {
          chartData.data[dataKeys[ix]].length = 0;
        }

        let tmpTimeValue;
        for (let ix = 0; ix < xAxisDataCount; ix++) {
          tmpTimeValue = +dayjs(timeValue).subtract(ix, 'second');
          chartData.labels.unshift(tmpTimeValue);

          Object.values(chartData.data).forEach((seriesData) => {
            seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
          });
        }
      };

      onMounted(() => {
        initChartSeries();
        initChartData();
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
        isLive,
        selectionItems,
        selectionRange,
        onDragSelect,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .description-label {
    vertical-align: top;
    margin-right: 3px;
  }

  .row {
    display: flex;
    margin-top: 15px;
    justify-content: space-between;
    .row-item {
      flex: 1;
      display: flex;
      .item-title {
        line-height: 33px;
        margin-right: 3px;
        min-width: 80px;
      }
    }
  }
</style>
