<template>
  <div class="case">
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
    <div class="description">
      <div class="row">
        <div class="row-item">
          <label>데이터 자동 업데이트</label>
          <ev-toggle v-model="isRealTime" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, shallowRef, watch, onUnmounted } from 'vue';

export default {
  setup() {
    const isRealTime = ref(true);

    const series = {
      series1: {
        name: 'series1',
        pointSize: 0.5,
        color: '#DF6264',
        pointFill: '#DF6264',
        overflowColor: '#FF00FF',
      },
      series2: {
        name: 'series2',
        pointSize: 0.5,
        color: '#3CA0FF',
        pointFill: '#3CA0FF',
        overflowColor: '#A3D3FF',
      },
    };

    let series2 = [];
    let series1 = [];
    // chartData를 shallowRef or shallowReactive로 선언하여야합니다.
    const chartData = shallowRef({
      series,
      data: {
        series1,
        series2,
      },
    });

    const chartOptions = ref({
      type: 'scatter',
      width: '100%',
      height: '100%',
      padding: { top: 20, right: 2, bottom: 4, left: 2 },
      axesX: [{
        type: 'time',
        timeFormat: 'HH:mm',
        interval: 'minute',
        showAxis: true,
        showGrid: false,
        axisLineColor: '#C9CFDC',
        labelStyle: {
          show: true,
          fontSize: 12,
          color: '#25262E',
          fontFamily: 'Roboto',
          fitDir: 'right',
        },
      }],
      axesY: [{
        type: 'linear',
        showAxis: true,
        startToZero: false,
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
      }],
      legend: {
        show: false,
      },
      displayOverflow: true,
      realTimeScatter: {
        use: true,
        range: 5, // 총 5분
      },
    });

    let transactionMonitorTimeoutId;

    let isInit = true;
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateData(num) {
      const data = [];

      function floor(number) {
        return Math.floor(number / 1000) * 1000;
      }

      for (let i = 0; i < num; i++) {
        let randomTime = 0;
        let randomElapsedTime = 0;
        if (!isInit) {
          randomTime = floor(Date.now() + getRandomInt(-3000, 0)); // -3초 ~ 현재
          randomElapsedTime = floor(getRandomInt(3000, 95000));
        } else {
          randomTime = floor(Date.now() + getRandomInt(-300000, 0)); // -5분 ~ 현재
          randomElapsedTime = floor(getRandomInt(3000, 57000));
        }
        const randomErrorCount = getRandomInt(0, 1);

        data.push({
          time: randomTime,
          elapsedTime: randomElapsedTime,
          count: 1,
          errorCount: randomErrorCount,
        });
      }
      return data;
    }

    let data;
    function getTransactionMonitorListHandler() {
      series1 = [];
      series2 = [];

      if (isInit) {
        data = generateData(10000);
        isInit = false;
      } else {
        data = generateData(100);
      }

      for (let i = 0; i < data.length; i++) {
        const time = data[i].time;
        const elapsedTime = data[i].elapsedTime;
        const errorCount = data[i].errorCount;

        if (errorCount === 1) {
          series1.push({
            x: time,
            y: elapsedTime / 1000,
          });
        } else {
          series2.push({
            x: time,
            y: elapsedTime / 1000,
          });
        }
      }

      chartData.value = {
        series,
        data: {
          series1,
          series2,
        },
      };
    }

    getTransactionMonitorListHandler();

    watch(() => isRealTime.value, () => {
      if (isRealTime.value) {
        transactionMonitorTimeoutId = setTimeout(function tick() {
          getTransactionMonitorListHandler();
          transactionMonitorTimeoutId = setTimeout(tick, 3000);
        }, 3000);
      } else {
        clearTimeout(transactionMonitorTimeoutId);
      }
    }, { immediate: true });

    onUnmounted(() => {
      clearTimeout(transactionMonitorTimeoutId);
    });

    return {
      isRealTime,
      chartData,
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
  margin-top: 15px;
  justify-content: space-between;
  gap: 12px;

  .row-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 4px;
    .item-title {
      line-height: 33px;
      margin-right: 3px;
      min-width: 80px;
    }
  }
}
</style>
