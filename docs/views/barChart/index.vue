<template>
  <div class="article-title">
    TEST PAGE
  </div>
  <p>테스트 체크포인트</p>
  <ev-checkbox>1. 차트가 잘 그려지는가? </ev-checkbox><br>
  <ev-checkbox>2. "selectLastTime" 버튼을 누르면 마지막 막대가 선택되는가? </ev-checkbox><br>
  <ev-checkbox>3. 막대를 클릭하면 클릭된 시간축의 값이 아래 출력되는가?</ev-checkbox><br>
  <ev-checkbox>4. 막대를 더블클릭하면 더블클릭된 시간축의 값이 아래 출력되는가?</ev-checkbox><br>
  <ev-checkbox>5. "데이터 자동업데이트" 를 On상태로 두면 새로운 값들이 들어오는가?</ev-checkbox><br>
  <ev-checkbox>6. 브라우저 사이즈를 변경하면 차트의 사이즈도 변경되는가?</ev-checkbox><br>
  <div class="case">
    <ev-chart
      ref="chart"
      :data="chartData"
      :options="chartOptions"
      @click="onClick"
      @dbl-click="onDblClick"
    />
    <div class="description">
      <ev-button
        @click="selectLastTime">
        selectLastValue
      </ev-button>
      <br><br>
      <div class="badge yellow">
        클릭된 라벨
      </div>
      {{ clickedLabel }}
      <br><br>
      <div class="badge yellow">
        더블 클릭된 라벨
      </div>
      {{ dblClickedLabel }}
      <br><br>
      <div>
        <span class="toggle-label">데이터 자동 업데이트</span>
        <ev-toggle
          v-model="isLive"
        />
      </div>
      <br><br>
      <ev-input-number
        v-model="thicknessSize"
        :step="0.1"
        :min="0"
        :max="1"
        :precision="1"
      />
    </div>
  </div>
</template>

<script>
  import { watch, ref, onBeforeUnmount, onMounted, reactive } from 'vue';
  import moment from 'moment';

  export default {
    setup() {
      const chart = ref(null);
      const thicknessSize = ref(1);

      const chartData = reactive({
        series: {
          series1: { name: 'series#1' },
        },
        labels: [],
        data: {
          series1: [],
        },
      });

      const chartOptions = reactive({
        type: 'bar',
        width: '100%',
        height: '80%',
        thickness: thicknessSize,
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        horizontal: false,
        axesX: [{
          type: 'time',
          showGrid: true,
          categoryMode: true,
          timeFormat: 'HH:mm:ss',
          interval: 'second',
        }],
        axesY: [{
          type: 'linear',
          startToZero: true,
          autoScaleRatio: 0.1,
          showGrid: false,
        }],
        selectItem: {
          use: true,
          showTextTip: true,
        },
      });

      const isLive = ref(false);
      const liveInterval = ref();
      let timeValue = moment().format('YYYY-MM-DD HH:mm:ss');

      const addRandomChartData = () => {
        if (isLive.value) {
          chartData.labels.shift();
        }

        timeValue = +moment(timeValue).add(1, 'second');
        chartData.labels.push(+moment(timeValue));

        Object.values(chartData.data).forEach((seriesData) => {
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
          liveInterval.value = setInterval(addRandomChartData, 1000);
        } else {
          clearTimeout(liveInterval.value);
        }
      });

      onBeforeUnmount(() => {
        clearTimeout(liveInterval.value);
      });

      const clickedLabel = ref("''");
      const onClick = (target) => {
        clickedLabel.value = target.label;
      };

      const dblClickedLabel = ref("''");
      const onDblClick = (target) => {
        dblClickedLabel.value = target.label;
      };

      const selectLastTime = () => {
        chart.value.selectItemByLabel(timeValue);
      };

      return {
        chart,
        isLive,
        chartData,
        chartOptions,
        thicknessSize,
        clickedLabel,
        dblClickedLabel,
        onClick,
        onDblClick,
        selectLastTime,
      };
    },
  };
</script>

<style lang="scss">
</style>
