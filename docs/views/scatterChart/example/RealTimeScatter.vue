<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart
        v-model:realTimeScatterReset="resetFlag"
        :data="chartData"
        :options="chartOptions"
      />
    </resizable-wrapper>
  </div>

  <div class="description">
    <div class="row">
      <div class="row-item">
        <label>데이터 자동 업데이트</label>
        <ev-toggle v-model="isRealTime" />
      </div>
      <div class="row-item">
        <span class="item-title"> 데이터 초기화 </span>
        <ev-button class="component" @click="dataReset"> reset </ev-button>
      </div>
      <div class="row-item">
        <span class="item-title"> change range (s) </span>
        <ev-input-number v-model="realTimeScatterRange" class="component" :min="10" :step="10" />
      </div>
    </div>
    <div class="row">
      <div class="row-item">
        <label>series1 공급</label>
        <ev-toggle v-model="feeding.series1" />
      </div>
      <div class="row-item">
        <label>series2 공급</label>
        <ev-toggle v-model="feeding.series2" />
      </div>
    </div>
    <p class="guide">
      특정 series 의 공급을 끄면, 그 series 의 누적 점이 가시 범위(range) 밖으로 모두 밀려난 뒤
      신규 점이 없을 때 누적 저장소·범례에서 <b>자동 제거</b>됩니다(realTimeScatter 기본 동작).
      다시 켜면 부활합니다. (빠르게 확인하려면 range 를 10s 수준으로 낮추세요.)
    </p>
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
        pointSize: 1,
        color: '#DF6264',
        pointFill: '#DF6264',
        overflowColor: '#FF00FF',
      },
      series2: {
        name: 'series2',
        pointSize: 1,
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
      axesX: [
        {
          type: 'time',
          timeFormat: 'HH:mm:ss',
          interval: { time: 10, unit: 'second' },
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
        },
      ],
      axesY: [
        {
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
        },
      ],
      tooltip: {
        use: true,
        formatter: ({ y }) => `${y}`,
      },
      legend: {
        show: true,
        position: 'bottom',
        padding: { top: 0, left: 0 },
        height: 32,
        virtualScroll: true,
      },
      displayOverflow: true,
      selectItem: { use: true },
      realTimeScatter: {
        use: true,
        range: realTimeScatterRange.value, // 총 5분, 초 단위
      },
      seriesReverse: true,
    });

    // series 별 데이터 공급 on/off. 끄면 그 series 는 빈 배열로 보내져(키는 유지) 만료 대상이 된다.
    const feeding = reactive({ series1: true, series2: true });

    let timeoutId;

    let isInit = true;
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const generateData = (num) => {
      const data = [];

      const floor = (number) => number;

      for (let i = 0; i < num; i++) {
        let randomX = 0;
        let randomY = 0;
        if (!isInit) {
          randomX = Math.round((Date.now() + getRandomInt(-3000, 0)) / 1000) * 1000; // 1초 격자
          randomY = getRandomInt(3, 15) * 1000;
        } else {
          randomX = Math.round((Date.now() + getRandomInt(-300000, 0)) / 1000) * 1000; // 1초 격자
          randomY = getRandomInt(3, 15) * 1000;
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
        data = generateData(600);
        isInit = false;
      } else {
        data = generateData(60);
      }

      for (let i = 0; i < data.length; i++) {
        const dataX = data[i].x;
        const dataY = data[i].y;
        const type = data[i].type;

        if (type === 1) {
          if (feeding.series1) {
            series1.push({
              x: dataX,
              y: dataY / 1000,
            });
          }
        } else if (feeding.series2) {
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
      timeoutId = setTimeout(tick, 1000);
    };

    watch(
      () => isRealTime.value,
      () => {
        if (isRealTime.value) {
          timeoutId = setTimeout(tick, 1000);
        } else {
          clearTimeout(timeoutId);
        }
      },
      { immediate: true },
    );

    watch(
      () => realTimeScatterRange.value,
      () => {
        chartOptions.realTimeScatter.range = realTimeScatterRange.value;
      },
    );

    const resetFlag = ref(false);
    const dataReset = () => {
      resetFlag.value = true;
      feeding.series1 = true;
      feeding.series2 = true;
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
      feeding,
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

.guide {
  margin-top: 12px;
  line-height: 1.5;
  font-size: 13px;
  color: #555;
}
</style>
