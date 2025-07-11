<template>
  <div class="case">
    <ev-chart
      ref="chart"
      v-model:selectedLabel="defaultSelectLabel"
      :data="chartData1"
      :options="chartOptions1"
      @click="onClick"
    />
    <ev-chart
      v-model:selectedLabel="defaultSelectLabel"
      :data="chartData2"
      :options="chartOptions2"
      @click="onClick"
    />
    <div class="options description">
      <ev-toggle v-model="isResetPosition" />
      <span>
        스크롤위치 초기화여부
      </span>

      <ev-toggle v-model="isFixedPosTop" />
      <span class="left">
        tip 위치를 최상단에 고정
      </span>

      <ev-button @click="toggleSelectData">
        <span>select by v-model</span>
      </ev-button>
      <span class="left">
        차트 클릭이 아닌 v-model:selectedLabel 에 바인딩한 dataIndex 배열을
        변경해서 라벨 선택
      </span>
      <ev-button @click="updateData">
        Update Data
      </ev-button>
      <span>
        데이터 업데이트
      </span>

      <ev-button @click="updateDataWithDynamicRange">
        Update Data With Dynamic Range
      </ev-button>
      <span>
        데이터 업데이트
      </span>

      <!-- options의 range를 직접 바꿔서 스크롤/데이터 동기화 테스트용 버튼 -->
      <ev-button @click="setRangeToFirstHalf">
        <span>range: 앞 절반</span>
      </ev-button>
      <span>
        데이터 업데이트
      </span>
      <ev-button @click="setRangeToLastHalf">
        <span>range: 뒤 절반</span>
      </ev-button>
      <span>
        데이터 업데이트
      </span>
      <span class="left">
        options의 range를 직접 바꿔서 스크롤/데이터 동기화 테스트
      </span>

      <!-- 10개 → 7개 테스트 버튼들 -->
      <ev-button @click="testTenToSeven">
        <span>데이터 10개로 설정</span>
      </ev-button>
      <span>
        테스트용 데이터 10개 생성
      </span>
      <ev-button @click="reduceToSeven">
        <span>데이터 7개로 줄이기</span>
      </ev-button>
      <span>
        데이터를 7개로 줄여서 스크롤바 나가는 문제 재현
      </span>

      <div />

      <div class="badge yellow">
        v-model:selectedLabel
      </div>
      <div>{{ defaultSelectLabel }}</div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  components: {},

  setup() {
    const chart = ref(null);

    const clickedLabel = ref();
    const onClick = ({ selected }) => {
      clickedLabel.value = selected;
    };

    const defaultSelectLabel = ref({
      dataIndex: [0],
    });

    const toggleSelectData = () => {
      const arr = defaultSelectLabel.value.dataIndex;
      const newIndex = (arr.pop() + 1) % 9;
      if (!arr.includes(newIndex)) {
        arr.push(newIndex);
      }
    };

    const isFixedPosTop = ref(false);

    const isResetPosition = ref(false);

    const chartData1 = ref({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      labels: [
        'value1',
        'value2',
        'value3',
        'value4',
        'value5',
        'value6',
        'value7',
        'value8',
        'value9',
        'value10',
      ],
      data: {
        series1: [100, 150, 51, 150, 350, 100, 150, 51, 150, 350],
        series2: [100, 150, 51, 150, 450, 100, 150, 51, 150, 450],
      },
    });

    const chartData2 = ref({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      labels: [
        'value1',
        'value2',
        'value3',
        'value4',
        'value5',
        'value6',
        'value7',
        'value8',
        'value9',
        'value10',
      ],
      data: {
        series1: [100, 150, 51, 150, 350, 100, 150, 51, 150, 350],
        series2: [100, 150, 51, 150, 450, 100, 150, 51, 150, 450],
      },
    });

    const RANGE = [0, 2];

    const chartOptions1 = ref({
      type: 'bar',
      thickness: 0.8,
      width: '100%',
      horizontal: false,
      title: {
        show: false,
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesX: [
        {
          type: 'step',
          showGrid: false,
          labelStyle: {
            fitWidth: true,
            fitDir: 'left',
          },
          range: RANGE,
          scrollbar: {
            use: true,
            showButton: true,
            resetPosition: isResetPosition,
          },
        },
      ],
      axesY: [
        {
          showAxis: true,
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
          showGrid: false,
        },
      ],
      selectLabel: {
        use: true,
        limit: 2,
        useDeselectOverflow: true,
        showTip: true,
        fixedPosTop: isFixedPosTop,
        useApproximateValue: true,
        tipBackground: '#FF0000',
        useSeriesOpacity: true,
        useLabelOpacity: true,
      },
      maxTip: {
        use: true,
        showTextTip: true,
        tipStyle: {
          background: '#FF0000',
        },
      },
    });

    const chartOptions2 = ref({
      type: 'bar',
      thickness: 0.8,
      width: '100%',
      horizontal: true,
      title: {
        show: false,
      },
      legend: {
        show: true,
        position: 'right',
      },
      axesY: [
        {
          type: 'step',
          showGrid: false,
          labelStyle: {
            fitWidth: true,
            fitDir: 'left',
          },
          range: RANGE,
          scrollbar: {
            use: true,
            showButton: true,
            resetPosition: isResetPosition,
          },
        },
      ],
      axesX: [
        {
          showAxis: true,
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
          showGrid: false,
        },
      ],
      selectLabel: {
        use: true,
        limit: 2,
        useDeselectOverflow: true,
        showTip: true,
        fixedPosTop: isFixedPosTop,
        useApproximateValue: true,
        tipBackground: '#FF0000',
        useSeriesOpacity: true,
        useLabelOpacity: true,
      },
      maxTip: {
        use: true,
        showTextTip: true,
        tipStyle: {
          background: '#FF0000',
        },
      },
    });

    const getRandArr = (count) =>
      Array(count)
        .fill(0)
        .map(() => Math.ceil(Math.random() * 100));

    const updateData = () => {
      // chartData1: 10개로 설정
      chartData1.value.labels = Array(10)
        .fill(0)
        .map((_, i) => `value${i + 1}`);
      chartData1.value.data.series1 = getRandArr(10);
      chartData1.value.data.series2 = getRandArr(10);

      // chartData2: 10개로 설정
      chartData2.value.labels = Array(10)
        .fill(0)
        .map((_, i) => `value${i + 1}`);
      chartData2.value.data.series1 = getRandArr(10);
      chartData2.value.data.series2 = getRandArr(10);
    };

    const updateDataWithDynamicRange = () => {
      // 5~10개 사이의 랜덤 길이로 라벨/데이터 생성
      const getRandLength = () => Math.floor(Math.random() * 6) + 5; // 5~10
      // 랜덤 길이
      const len = getRandLength();
      const labels = Array(len)
        .fill(0)
        .map((_, i) => `value${i + 1}`);
      const series1 = getRandArr(len);
      const series2 = getRandArr(len);

      chartData1.value.labels = labels;
      chartData1.value.data.series1 = series1;
      chartData1.value.data.series2 = series2;

      chartData2.value.labels = labels;
      chartData2.value.data.series1 = series1;
      chartData2.value.data.series2 = series2;
    };

    // 구체적인 테스트: 10개 → 7개로 줄이기
    const testTenToSeven = () => {
      // chartData1: 10개로 설정
      chartData1.value.labels = Array(10)
        .fill(0)
        .map((_, i) => `value${i + 1}`);
      chartData1.value.data.series1 = getRandArr(10);
      chartData1.value.data.series2 = getRandArr(10);

      // chartData2: 10개로 설정
      chartData2.value.labels = Array(10)
        .fill(0)
        .map((_, i) => `value${i + 1}`);
      chartData2.value.data.series1 = getRandArr(10);
      chartData2.value.data.series2 = getRandArr(10);
    };

    // 7개로 줄이기
    const reduceToSeven = () => {
      // chartData1: 7개로 줄이기
      chartData1.value.labels = Array(7)
        .fill(0)
        .map((_, i) => `value${i + 1}`);
      chartData1.value.data.series1 = getRandArr(7);
      chartData1.value.data.series2 = getRandArr(7);

      // chartData2: 7개로 줄이기
      chartData2.value.labels = Array(7)
        .fill(0)
        .map((_, i) => `value${i + 1}`);
      chartData2.value.data.series1 = getRandArr(7);
      chartData2.value.data.series2 = getRandArr(7);
    };

    // options의 range를 앞 절반으로 설정하는 함수
    const setRangeToFirstHalf = () => {
      // chartData1: X축 range
      const len1 = chartData1.value.labels.length;
      chartOptions1.value.axesX[0].range = [0, Math.floor(len1 / 2)];
      // chartData2: Y축 range
      const len2 = chartData2.value.labels.length;
      chartOptions2.value.axesY[0].range = [0, Math.floor(len2 / 2)];
    };
    // options의 range를 뒤 절반으로 설정하는 함수
    const setRangeToLastHalf = () => {
      const len1 = chartData1.value.labels.length;
      chartOptions1.value.axesX[0].range = [Math.floor(len1 / 2), len1 - 1];
      const len2 = chartData2.value.labels.length;
      chartOptions2.value.axesY[0].range = [Math.floor(len2 / 2), len2 - 1];
    };

    return {
      chart,
      chartData1,
      chartData2,
      isFixedPosTop,
      isResetPosition,
      chartOptions1,
      chartOptions2,
      defaultSelectLabel,
      updateData,
      updateDataWithDynamicRange,
      onClick,
      toggleSelectData,
      // range 테스트용 함수 추가
      setRangeToFirstHalf,
      setRangeToLastHalf,
      testTenToSeven,
      reduceToSeven,
    };
  },
};
</script>

<style lang="scss" scoped>
.options {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
}
</style>
