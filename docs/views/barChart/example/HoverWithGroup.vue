<template>
  <ev-chart-group :options="{ syncHover }">
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
      <ev-toggle v-model="syncHover" />
      <span>그룹 호버 동기화</span>
      <br>
      <br>
      <span>차트별 호버 동기화</span>
      <br>
      <br>
      <div class="hover-options">
        <span>첫번째 차트</span>
        <ev-toggle v-model="syncHoverChart1" />
        <span>두번째 차트</span>
        <ev-toggle v-model="syncHoverChart2" />
        <span>세번째 차트</span>
        <ev-toggle v-model="syncHoverChart3" />
        <span>네번째 차트</span>
        <ev-toggle v-model="syncHoverChart4" />
      </div>
      <br>
      <br>
      <ev-toggle v-model="isLive" />
      <span>데이터 자동 업데이트</span>
      <br>
      <br>
      <ev-button @click="toggleSelectData">
        select by v-model
      </ev-button>
      <span class="left">
        차트 클릭이 아닌 v-model:selectedLabel 에 바인딩한 dataIndex 배열을 변경해서 라벨 선택
      </span>
      <br>
      <br>
      <ev-toggle v-model="isFixedPosTop" />
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
  </ev-chart-group>
</template>

<script>
import { ref, reactive, onMounted, watch, onBeforeUnmount } from 'vue';
import dayjs from 'dayjs';

export default {
  components: {},

  setup() {
    const groupHoveredLabel = ref();
    const chart = ref(null);

    const chartData1 = reactive({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      labels: [],
      groups: [['series1', 'series2']],
      data: {
        series1: [],
        series2: [],
      },
    });
    const chartData2 = reactive({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      labels: [],
      groups: [['series1', 'series2']],
      data: {
        series1: [],
        series2: [],
      },
    });
    const chartData3 = reactive({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      labels: [],
      data: {
        series1: [],
        series2: [],
      },
    });
    const chartData4 = reactive({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      labels: [],
      groups: [['series1', 'series2']],
      data: {
        series1: [],
        series2: [],
      },
    });

    const isFixedPosTop = ref(false);

    const syncHoverChart1 = ref(true);

    const chartOptions1 = ref({
      syncHover: syncHoverChart1.value,
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
        type: 'time',
        showGrid: false,
        categoryMode: true,
        timeFormat: 'mm:ss',
        interval: 'second',
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
      indicator: {
        color: '#626872',
        segments: [4, 2],
      },
    });

    watch(syncHoverChart1, (newSyncHover) => {
      chartOptions1.value.syncHover = newSyncHover;
    });

    const syncHoverChart2 = ref(true);

    const chartOptions2 = ref({
      syncHover: syncHoverChart2.value,
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
        type: 'time',
        showGrid: false,
        categoryMode: true,
        timeFormat: 'mm:ss',
        interval: 'second',
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
      indicator: {
        color: '#626872',
        segments: [4, 2],
      },
    });

    watch(syncHoverChart2, (newSyncHover) => {
      chartOptions2.value.syncHover = newSyncHover;
    });

    const syncHoverChart3 = ref(true);

    const chartOptions3 = ref({
      syncHover: syncHoverChart3.value,
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
        type: 'time',
        showGrid: false,
        categoryMode: true,
        timeFormat: 'mm:ss',
        interval: 'second',
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
      indicator: {
        color: '#626872',
        segments: [4, 2],
      },
    });

    watch(syncHoverChart3, (newSyncHover) => {
      chartOptions3.value.syncHover = newSyncHover;
    });

    const syncHoverChart4 = ref(true);

    const chartOptions4 = ref({
      syncHover: syncHoverChart4.value,
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
        type: 'time',
        showGrid: false,
        categoryMode: true,
        timeFormat: 'mm:ss',
        interval: 'second',
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
      indicator: {
        color: '#626872',
        segments: [4, 2],
      },
    });

    watch(syncHoverChart4, (newSyncHover) => {
      chartOptions4.value.syncHover = newSyncHover;
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

    const syncHover = ref(true);

    const isLive = ref(false);
    const liveInterval = ref();
    let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const addRandomChartData = () => {
      if (isLive.value) {
        chartData1.labels.shift();
        chartData2.labels.shift();
        chartData3.labels.shift();
        chartData4.labels.shift();
      }

      timeValue = dayjs(timeValue).add(6, 'second');
      chartData1.labels.push(dayjs(timeValue));
      chartData2.labels.push(dayjs(timeValue));
      chartData3.labels.push(dayjs(timeValue));
      chartData4.labels.push(dayjs(timeValue));

      Object.values(chartData1.data).forEach((seriesData) => {
        if (isLive.value) {
          seriesData.shift();
        }
        seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
      });
      Object.values(chartData2.data).forEach((seriesData) => {
        if (isLive.value) {
          seriesData.shift();
        }
        seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
      });
      Object.values(chartData3.data).forEach((seriesData) => {
        if (isLive.value) {
          seriesData.shift();
        }
        seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
      });
      Object.values(chartData4.data).forEach((seriesData) => {
        if (isLive.value) {
          seriesData.shift();
        }
        seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
      });
    };

    onMounted(() => {
      for (let ix = 0; ix < 10; ix++) {
        addRandomChartData();
      }
    });

    watch(isLive, (newValue) => {
      if (newValue) {
        addRandomChartData();
        liveInterval.value = setInterval(addRandomChartData, 2000);
      } else {
        clearInterval(liveInterval.value);
      }
    });

    onBeforeUnmount(() => {
      clearInterval(liveInterval.value);
    });

    return {
      syncHover,
      syncHoverChart1,
      syncHoverChart2,
      syncHoverChart3,
      syncHoverChart4,
      isLive,
      groupHoveredLabel,
      chart,
      chartData1,
      chartData2,
      chartData3,
      chartData4,
      isFixedPosTop,
      chartOptions1,
      chartOptions2,
      chartOptions3,
      chartOptions4,
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
  .hover-options {
    display: flex;
    align-items: center;
  }
</style>
