<template>
  <div class="case">
    <ev-chart
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
    <div class="description">
      <div class="option">
        <ev-toggle v-model="isLive" />
        <span>데이터 자동 업데이트</span>
      </div>
      <div class="option">
        <ev-toggle v-model="isUseClick" />
        <span>클릭 기능 enable ( false 일때는 v-model 값으로만 변경 )</span>
      </div>
      <div class="option">
        <ev-button @click="updateSelectedLabel">
          select by v-model
        </ev-button>
        <span>
          차트 클릭이 아닌 v-model:selectedLabel 에 바인딩한 dataIndex 배열을 변경해서 라벨 선택
        </span>
      </div>
      <div class="option">
        <ev-toggle v-model="isDeselctOverflow" />
        <span>
          DeselectOverflow: 설정한 limit 를 넘어서 클릭했을때 선입선출로 deselect 를 할지를 옵션으로 선택 가능
        </span>
      </div>
      <div class="option">
        <ev-toggle v-model="useSeriesOpacity" />
        <span>
        useSeriesOpacity: 시리즈 opacity 변경 여부
      </span>
      </div>
      <div class="option">
        <ev-toggle v-model="useLabelOpacity" />
        <span>
        useLabelOpacity:  Axes Label opacity 변경 여부
        </span>
      </div>
      <div class="option">
        <ev-input-number
            v-model="limit"
            :min="1"
            :max="7"
        />
        <span>
          limit: 선택할 라벨의 최대 갯수
        </span>
      </div>
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
      </div>
    </div>
</div>
</template>

<script>
import { reactive, ref, watch } from 'vue';

  export default {
    setup() {
      const timeList = ['04-06', '06-09', '09-11', '11-14', '14-16', '16-18', '18-21', '21-24', '24-04'];
      const dayList = ['Weekday', 'Saturday', 'Sunday'];
      const chartData1 = reactive({
        series: {
          series1: {
            name: 'series#1',
            showValue: {
              use: true,
            },
          },
        },
        labels: {
          x: [...timeList],
          y: [...dayList],
        },
        data: {
          series1: [
            { x: '04-06', y: 'Weekday', value: 0 },
            { x: '04-06', y: 'Saturday', value: 2 },
            { x: '04-06', y: 'Sunday', value: 1 },
            { x: '06-09', y: 'Weekday', value: 22 },
            { x: '06-09', y: 'Saturday', value: 1 },
            { x: '06-09', y: 'Sunday', value: 22 },
            { x: '09-11', y: 'Weekday', value: 55 },
            { x: '09-11', y: 'Saturday', value: 43 },
            { x: '09-11', y: 'Sunday', value: 85 },
            { x: '11-14', y: 'Weekday', value: 51 },
            { x: '11-14', y: 'Saturday', value: 87 },
            { x: '11-14', y: 'Sunday', value: 100 },
            { x: '14-16', y: 'Weekday', value: 38 },
            { x: '14-16', y: 'Saturday', value: 93 },
            { x: '14-16', y: 'Sunday', value: 58 },
            { x: '16-18', y: 'Weekday', value: 22 },
            { x: '16-18', y: 'Saturday', value: 71 },
            { x: '16-18', y: 'Sunday', value: 26 },
            { x: '18-21', y: 'Weekday', value: 17 },
            { x: '18-21', y: 'Saturday', value: 31 },
            { x: '18-21', y: 'Sunday', value: 10 },
            { x: '21-24', y: 'Weekday', value: 8 },
            { x: '21-24', y: 'Saturday', value: 24 },
            { x: '21-24', y: 'Sunday', value: 12 },
            { x: '24-04', y: 'Weekday', value: 2 },
            { x: '24-04', y: 'Saturday', value: 15 },
            { x: '24-04', y: 'Sunday', value: 3 },
          ],
        },
      });
      const chartData2 = reactive({
        series: {
          series1: {
            name: 'series#1',
            showValue: {
              use: true,
            },
          },
        },
        labels: {
          x: [...dayList],
          y: [...timeList],
        },
        data: {
          series1: [
            { x: 'Weekday', y: '04-06', value: 0 },
            { x: 'Saturday', y: '04-06', value: 2 },
            { x: 'Sunday', y: '04-06', value: 1 },
            { x: 'Weekday', y: '06-09', value: 22 },
            { x: 'Saturday', y: '06-09', value: 1 },
            { x: 'Sunday', y: '06-09', value: 22 },
            { x: 'Weekday', y: '09-11', value: 55 },
            { x: 'Saturday', y: '09-11', value: 43 },
            { x: 'Sunday', y: '09-11', value: 85 },
            { x: 'Weekday', y: '11-14', value: 51 },
            { x: 'Saturday', y: '11-14', value: 87 },
            { x: 'Sunday', y: '11-14', value: 100 },
            { x: 'Weekday', y: '14-16', value: 38 },
            { x: 'Saturday', y: '14-16', value: 93 },
            { x: 'Sunday', y: '14-16', value: 58 },
            { x: 'Weekday', y: '16-18', value: 22 },
            { x: 'Saturday', y: '16-18', value: 71 },
            { x: 'Sunday', y: '16-18', value: 26 },
            { x: 'Weekday', y: '18-21', value: 17 },
            { x: 'Saturday', y: '18-21', value: 31 },
            { x: 'Sunday', y: '18-21', value: 10 },
            { x: 'Weekday', y: '21-24', value: 8 },
            { x: 'Saturday', y: '21-24', value: 24 },
            { x: 'Sunday', y: '21-24', value: 12 },
            { x: 'Weekday', y: '24-04', value: 2 },
            { x: 'Saturday', y: '24-04', value: 15 },
            { x: 'Sunday', y: '24-04', value: 3 },
          ],
        },
      });

      const isUseClick = ref(true);
      const isDeselctOverflow = ref(true);
      const useSeriesOpacity = ref(true);
      const useLabelOpacity = ref(true);
      const limit = ref(2);

      const chartOptions1 = reactive({
        type: 'heatMap',
        width: '100%',
        height: '300px',
        title: {
          text: 'Chart Title',
          show: true,
        },
        indicator: {
          use: true,
        },
        axesX: [{
          type: 'step',
          showGrid: false,
        }],
        axesY: [{
          type: 'step',
          showGrid: false,
        }],
        heatMapColor: {
          categoryColors: [
            { color: '#F2F2F2', label: '< 20' },
            { color: '#C4DBD1', label: '20 - 39' },
            { color: '#96C4B0', label: '40 - 59' },
            { color: '#68AD8F', label: '60 - 79' },
            { color: '#3A946C', label: '80 <=' },
          ],
          stroke: {
            show: true,
            color: '#FFFFFF',
            lineWidth: 2,
            radius: 8,
          },
        },
        tooltip: {
          use: true,
        },
        selectLabel: {
          use: true,
          showTip: true,
          useApproximateValue: true,
          tipBackground: '#E76F51',
          useClick: isUseClick,
          useDeselectOverflow: isDeselctOverflow,
          limit,
          useSeriesOpacity,
          useLabelOpacity,
        },
      });

      const chartOptions2 = reactive({
        type: 'heatMap',
        width: '100%',
        height: '300px',
        horizontal: true,
        title: {
          text: 'Chart Title',
          show: true,
        },
        indicator: {
          use: true,
        },
        axesX: [{
          type: 'step',
          showGrid: false,
        }],
        axesY: [{
          type: 'step',
          showGrid: false,
        }],
        heatMapColor: {
          categoryColors: [
            { color: '#F2F2F2', label: '< 20' },
            { color: '#C4DBD1', label: '20 - 39' },
            { color: '#96C4B0', label: '40 - 59' },
            { color: '#68AD8F', label: '60 - 79' },
            { color: '#3A946C', label: '80 <=' },
          ],
          stroke: {
            show: true,
            color: '#FFFFFF',
            lineWidth: 2,
            radius: 8,
          },
        },
        tooltip: {
          use: true,
        },
        selectLabel: {
          use: true,
          showTip: true,
          useApproximateValue: true,
          tipBackground: '#E76F51',
          useClick: isUseClick,
          useDeselectOverflow: isDeselctOverflow,
          limit,
          useSeriesOpacity,
          useLabelOpacity,
        },
      });

      const clickedLabel = ref('');
      const defaultSelectLabel = ref({
        dataIndex: [2],
      });
      const onClick = ({ selected }) => {
        clickedLabel.value = selected;
      };

      const updateSelectedLabel = () => {
        const arr = defaultSelectLabel.value.dataIndex;
        const newIndex = (arr.pop() + 1) % 9;
        if (!arr.includes(newIndex)) {
          arr.push(newIndex);
        }
      };

      const isLive = ref(false);
      let liveInterval;
      let timeIndex = 0;

      const addRandomChartData = () => {
        if (timeIndex > 8) {
          timeIndex = 0;
        }
        const targetTime = timeList[timeIndex];
        chartData1.labels.x.shift();
        chartData2.labels.y.shift();
        chartData1.labels.x.push(targetTime);
        chartData2.labels.y.push(targetTime);

        const dataByChart1 = chartData1.data.series1;
        const dataByChart2 = chartData2.data.series1;
        dataByChart1.splice(0, 3);
        dataByChart2.splice(0, 3);
        dayList.forEach((day) => {
          const randomValue = Math.ceil(Math.random() * 100);
          dataByChart1.push({ x: targetTime, y: day, value: randomValue });
          dataByChart2.push({ x: day, y: targetTime, value: randomValue });
        });

        timeIndex++;
      };

      watch(isLive, (newVal) => {
        if (newVal) {
          addRandomChartData();
          liveInterval = setInterval(addRandomChartData, 2000);
        } else {
          clearInterval(liveInterval);
        }
      });

      return {
        chartData1,
        chartData2,
        chartOptions1,
        chartOptions2,
        isLive,
        isUseClick,
        isDeselctOverflow,
        useSeriesOpacity,
        useLabelOpacity,
        limit,
        defaultSelectLabel,
        clickedLabel,
        onClick,
        updateSelectedLabel,
      };
    },
  };
</script>

<style lang="scss" scoped>
.description {
  position: relative;

  .option {
    display: flex;
    gap: 10px;
    height: 30px;
    line-height: 20px;
    margin: 10px 0;
  }

  .ev-input-number + span {
    line-height: 35px;
  }

  .ev-button {
    height: 20px;
    line-height: 20px !important;
  }
}
</style>
