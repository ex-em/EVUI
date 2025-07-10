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
      labels: ['value1', 'value2', 'value3', 'value4', 'value5'],
      data: {
        series1: [100, 150, 51, 150, 350],
        series2: [100, 150, 51, 150, 450],
      },
    });

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
          range: [0, 1],
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
          range: [0, 1],
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

    const updateData = () => {
      const getRandArr = (count) =>
        Array(count)
          .fill(0)
          .map(() => Math.ceil(Math.random() * 100));

      const chartList = [chartData1, chartData2];
      chartList.forEach((c) => {
        const seriesList = ['series1', 'series2'];
        seriesList.forEach((sId) => {
          c.value.data[sId] = getRandArr(5);
        });
      });
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
      onClick,
      toggleSelectData,
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
