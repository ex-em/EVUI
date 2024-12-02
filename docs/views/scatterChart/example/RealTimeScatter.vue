<template>
  <div class="case">
    <ev-chart
      v-model:realTimeScatterReset="resetFlag"
      :data="chartData"
      :options="chartOptions"
    />
    <div class="description">
      <div class="row">
        <div class="row-item">
          <label>데이터 자동 업데이트</label>
          <ev-toggle v-model="isRealTime" />
        </div>
        <div class="row-item">
          <span class="item-title">
            데이터 초기화
          </span>
          <ev-button
            class="component"
            @click="dataReset"
          >
            reset
          </ev-button>
        </div>
        <div class="row-item">
          <span class="item-title">
            change range (s)
          </span>
          <ev-input-number
            v-model="realTimeScatterRange"
            class="component"
            :min="50"
            :step="50"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, shallowRef, watch, onUnmounted, reactive } from 'vue';

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

    const realTimeScatterRange = ref(300);
    const chartOptions = reactive({
      type: 'scatter',
      width: '100%',
      height: '100%',
      padding: { top: 20, right: 2, bottom: 4, left: 2 },
      axesX: [{
        type: 'time',
        timeFormat: 'HH:mm:ss',
        interval: 'second',
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
        flow: true,
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
        range: realTimeScatterRange.value, // 총 5분, 초 단위
      },
    });

    let timeoutId;

    let isInit = true;
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const generateData = (num) => {
      const data = [];

      const floor = number => Math.floor(number / 1000) * 1000;

      for (let i = 0; i < num; i++) {
        let randomX = 0;
        let randomY = 0;
        if (!isInit) {
          randomX = floor(Date.now() + getRandomInt(-3000, 0)); // -3초 ~ 현재
          randomY = floor(getRandomInt(3000, 95000));
        } else {
          randomX = floor(Date.now() + getRandomInt(-300000, 0)); // -5분 ~ 현재
          randomY = floor(getRandomInt(3000, 57000));
        }
        const randomType = getRandomInt(0, 1);

        data.push({
          x: randomX,
          y: randomY,
          type: randomType,
        });
      }
      return data;
    };

    let data;
    const setDataHandler = () => {
      series1 = [];
      series2 = [];

      if (isInit) {
        data = generateData(10000);
        isInit = false;
      } else {
        data = generateData(100);
      }

      for (let i = 0; i < data.length; i++) {
        const dataX = data[i].x;
        const dataY = data[i].y;
        const type = data[i].type;

        if (type === 1) {
          series1.push({
            x: dataX,
            y: dataY / 1000,
          });
        } else {
          series2.push({
            x: dataX,
            y: dataY / 1000,
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
    };

    setDataHandler();

    const tick = () => {
      setDataHandler();
      timeoutId = setTimeout(tick, 3000);
    };

    watch(() => isRealTime.value, () => {
      if (isRealTime.value) {
        timeoutId = setTimeout(tick, 3000);
      } else {
        clearTimeout(timeoutId);
      }
    }, { immediate: true });

    watch(() => realTimeScatterRange.value, () => {
      chartOptions.realTimeScatter.range = realTimeScatterRange.value;
    });

    const resetFlag = ref(false);
    const dataReset = () => {
      resetFlag.value = true;
      chartData.value = {
        series,
        data: {
          series1: [],
          series2: [],
        },
      };
    };

    onUnmounted(() => {
      clearTimeout(timeoutId);
    });

    return {
      isRealTime,
      chartData,
      chartOptions,
      realTimeScatterRange,
      resetFlag,
      dataReset,
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
