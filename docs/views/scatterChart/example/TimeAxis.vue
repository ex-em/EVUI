<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart
        :data="chartData"
        :options="chartOptions"
      />
    </resizable-wrapper>

    <div class="description">
      <div class="row">
        <div class="row-item">
          <span class="item-title">
            Interval Value
          </span>
          <ev-input-number
            v-model="intervalValue"
            class="component"
            :min="0"
          />
          <span class="item-title">
            Interval Unit
          </span>
          <ev-select
            v-model="intervalUnit"
            class="component"
            :items="[{
              name: 'second',
              value: 'second',
            }, {
              name: 'minute',
              value: 'minute',
            }, {
              name: 'hour',
              value: 'hour',
            }, {
              name: 'day',
              value: 'day',
            }, {
              name: 'week',
              value: 'week',
            }]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    // 최근 3시간 이내의 10초 간격 데이터 생성
    const generateTimeSeriesData = () => {
      const now = dayjs();
      const threeHoursAgo = now.subtract(3, 'hour');
      const dataPoints = [];

      // 3시간 = 10800초, 10초 간격이면 1080개의 데이터 포인트
      let currentTime = threeHoursAgo;
      while (currentTime.isBefore(now) || currentTime.isSame(now)) {
        const y = Math.floor(Math.random() * 100) + 1; // 1-100 사이의 랜덤 값
        dataPoints.push({
          x: currentTime.valueOf(),
          y,
        });
        currentTime = currentTime.add(10, 'second');
      }

      return dataPoints;
    };

    const chartData = reactive({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      data: {
        series1: generateTimeSeriesData(),
      },
    });

    const intervalValue = ref(10);
    const intervalUnit = ref('second');

    const chartOptions = computed(() => ({
      type: 'scatter',
      width: '100%',
      height: '100%',
      axesX: [{
        type: 'time',
        timeFormat: 'HH:mm:ss',
        interval: {
          time: intervalValue.value,
          unit: intervalUnit.value,
        },
      }],
      axesY: [{
        type: 'linear',
        showAxis: true,
        startToZero: true,
        autoScaleRatio: null,
        showGrid: true,
        axisLineColor: '#C9CFDC',
        gridLineColor: '#C9CFDC',
        labelStyle: {
          show: true,
          fontSize: 12,
          color: '#25262E',
          fontFamily: 'Roboto',
          fitWidth: false,
          fitDir: 'right',
        },
        plotLines: [],
        plotBands: [],
        formatter: null,
      }],
      title: {
        text: '',
        show: false,
      },
      legend: {
        show: false,
        position: 'right',
        color: '#353740',
        inactive: '#aaa',
        width: 140,
        height: 24,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      },
      tooltip: {
        use: false,
      },
      selectItem: {
        use: false,
      },
      dragSelection: {
        use: false,
        keepDisplay: true,
        fillColor: '#38ACEC',
        opacity: 0.65,
      },
    }));

    return {
      chartData,
      intervalValue,
      intervalUnit,
      chartOptions,
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
    flex-direction: column;
    margin-top: 15px;
    justify-content: space-between;
    gap: 30px;
    .row-item {
      flex: 1;
      display: flex;
      .item-title {
        line-height: 33px;
        margin-right: 3px;
        min-width: 80px;
        text-align: right;
      }
    }
    .check-box {
      display: flex;
      margin-left: 4px;
    }
  }
</style>
