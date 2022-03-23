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
    <ev-chart
      v-model:selectedLabel="defaultSelectLabel"
      :data="chartData3"
      :options="chartOptions3"
      @click="onClick"
    />
    <ev-chart
      v-model:selectedLabel="defaultSelectLabel"
      :data="chartData4"
      :options="chartOptions4"
      @click="onClick"
    />
    <div class="description">
      <ev-button @click="toggleSelectData">
        select by v-model
      </ev-button>
      <span class="left">
        차트 클릭이 아닌 v-model:selectedLabel 에 바인딩한 dataIndex 배열을 변경해서 라벨 선택
      </span>
      <br>
      <br>
      <ev-button @click="togglePosition">
        Tip Position
      </ev-button>
      <span class="left">
        tip 위치를 최상단에 고정
      </span>
      <br>
      <br>
      <ev-button @click="toggleOverflow">
        Deselect Overflow
      </ev-button>
      <span class="left">
        설정한 limit 를 넘어서 클릭했을때 선입선출로 deselect 를 할지를 옵션으로 선택 가능
      </span>
      <br>
      <br>
      <ev-button @click="updateData">
        Update Data
      </ev-button>
      <span class="left">
        차트 데이터를 변경하면 팁의 위치만 변경, 라벨은 고정
      </span>
      <br>
      <br>
      <div>
        <div class="badge yellow">
          v-model:selectedLabel
        </div>
        {{ defaultSelectLabel }}
        <br>
        <br>
        <div class="badge yellow">
          클릭 이벤트 데이터 (selected)
        </div>
        {{ clickedLabel }}
        <br>
        <br>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  components: {},

  setup() {
    const chart = ref(null);

    const chartData1 = ref({
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
    const chartData2 = ref({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      labels: ['value1', 'value2', 'value3', 'value4', 'value5'],
      groups: [['series1', 'series2']],
      data: {
        series1: [100, 150, 51, 150, 350],
        series2: [100, 150, 51, 150, 450],
      },
    });
    const chartData3 = ref({
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
    const chartData4 = ref({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      labels: ['value1', 'value2', 'value3', 'value4', 'value5'],
      groups: [['series1', 'series2']],
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
      axesX: [{
        type: 'step',
        showGrid: false,
        labelStyle: {
          fitWidth: true,
          fitDir: 'left',
        },
      }],
      axesY: [{
        showAxis: true,
        type: 'linear',
        startToZero: true,
        autoScaleRatio: 0.1,
        showGrid: false,
      }],
      selectLabel: {
        use: true,
        limit: 2,
        useDeselectOverflow: true,
        showTip: true,
        fixedPosTop: false,
        useApproximateValue: true,
        tipBackground: '#FF0000',
        useSeriesOpacity: true,
        useLabelOpacity: true,
      },
      maxTip: {
        use: true,
        showTextTip: true,
        tipBackground: '#FF0000',
      },
    });
    const chartOptions2 = ref({
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
      axesX: [{
        type: 'step',
        showGrid: false,
        labelStyle: {
          fitWidth: true,
          fitDir: 'left',
        },
      }],
      axesY: [{
        showAxis: true,
        type: 'linear',
        startToZero: true,
        autoScaleRatio: 0.1,
        showGrid: false,
      }],
      selectLabel: {
        use: true,
        limit: 2,
        useDeselectOverflow: true,
        showTip: true,
        fixedPosTop: false,
        useApproximateValue: true,
        tipBackground: '#FF0000',
        useSeriesOpacity: true,
        useLabelOpacity: true,
      },
      maxTip: {
        use: true,
        showTextTip: true,
        tipBackground: '#FF0000',
      },
    });
    const chartOptions3 = ref({
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
      axesY: [{
        type: 'step',
        showGrid: false,
        labelStyle: {
          fitWidth: true,
          fitDir: 'left',
        },
      }],
      axesX: [{
        showAxis: true,
        type: 'linear',
        startToZero: true,
        autoScaleRatio: 0.1,
        showGrid: false,
      }],
      selectLabel: {
        use: true,
        limit: 2,
        useDeselectOverflow: true,
        showTip: true,
        fixedPosTop: false,
        useApproximateValue: true,
        tipBackground: '#FF0000',
        useSeriesOpacity: true,
        useLabelOpacity: true,
      },
      maxTip: {
        use: true,
        showTextTip: true,
        tipBackground: '#FF0000',
      },
    });
    const chartOptions4 = ref({
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
      axesY: [{
        type: 'step',
        showGrid: false,
        labelStyle: {
          fitWidth: true,
          fitDir: 'left',
        },
      }],
      axesX: [{
        showAxis: true,
        type: 'linear',
        startToZero: true,
        autoScaleRatio: 0.1,
        showGrid: false,
      }],
      selectLabel: {
        use: true,
        limit: 2,
        useDeselectOverflow: true,
        showTip: true,
        fixedPosTop: false,
        useApproximateValue: true,
        tipBackground: '#FF0000',
        useSeriesOpacity: true,
        useLabelOpacity: true,
      },
      maxTip: {
        use: true,
        showTextTip: true,
        tipBackground: '#FF0000',
      },
    });

    const clickedLabel = ref();
    const onClick = ({ selected }) => {
      clickedLabel.value = selected;
    };

    const defaultSelectItem = ref({
      seriesID: 'series1',
      dataIndex: 1,
    });
    const defaultSelectLabel = ref({
      dataIndex: [0],
    });

    const toggleSelectData = () => {
      const arr = defaultSelectLabel.value.dataIndex;
      arr.push((arr.pop() + 1) % 5);
    };

    const togglePosition = () => {
      const b = chartOptions1.value.selectLabel.fixedPosTop;
      chartOptions1.value.selectLabel.fixedPosTop = !b;
      chartOptions2.value.selectLabel.fixedPosTop = !b;
      chartOptions3.value.selectLabel.fixedPosTop = !b;
      chartOptions4.value.selectLabel.fixedPosTop = !b;
    };

    const toggleOverflow = () => {
      const b = chartOptions1.value.selectLabel.useDeselectOverflow;
      chartOptions1.value.selectLabel.useDeselectOverflow = !b;
      chartOptions2.value.selectLabel.useDeselectOverflow = !b;
      chartOptions3.value.selectLabel.useDeselectOverflow = !b;
      chartOptions4.value.selectLabel.useDeselectOverflow = !b;
    };

    const updateData = () => {
      const getRandArr = count => Array(count)
        .fill(0).map(() => Math.ceil(Math.random() * 100));

      const chartList = [chartData1, chartData2, chartData3, chartData4];
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
      chartData3,
      chartData4,
      chartOptions1,
      chartOptions2,
      chartOptions3,
      chartOptions4,
      clickedLabel,
      defaultSelectItem,
      defaultSelectLabel,
      onClick,
      toggleSelectData,
      togglePosition,
      toggleOverflow,
      updateData,
    };
  },
};
</script>

<style lang="scss" scoped>
  .description {
    position: relative;
  }
  .left {
    position: absolute;
    left: 160px;
    padding-top: 10px;
  }
</style>
