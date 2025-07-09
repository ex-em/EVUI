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
      :data="chartData3"
      :options="chartOptions3"
      @click="onClick"
    />
    <div class="description">
      <ev-button @click="updateData">
        Update Data
      </ev-button>
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

    const isFixedPosTop = ref(false);

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
      const newIndex = (arr.pop() + 1) % 9;
      if (!arr.includes(newIndex)) {
        arr.push(newIndex);
      }
    };

    const toggleOverflow = () => {
      const b = chartOptions1.value.selectLabel.useDeselectOverflow;
      chartOptions1.value.selectLabel.useDeselectOverflow = !b;
      chartOptions3.value.selectLabel.useDeselectOverflow = !b;
    };

    const updateData = () => {
      const getRandArr = (count) =>
        Array(count)
          .fill(0)
          .map(() => Math.ceil(Math.random() * 100));

      const chartList = [chartData1, chartData3];
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
      chartData3,
      isFixedPosTop,
      chartOptions1,
      chartOptions3,
      clickedLabel,
      defaultSelectItem,
      defaultSelectLabel,
      onClick,
      toggleSelectData,
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
