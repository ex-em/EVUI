<template>
   <div class="case">
    <div class="chart-container">
        <div class="chart-wrapper" :style="{ height: `${chartHeight}px` }">
            <ev-chart
            :data="chartData"
            :options="chartOptions"
            />
        </div>
    </div>
     <div class="description">
       <div class="control-item">
         <span class="toggle-label">데이터 자동 업데이트</span>
         <ev-toggle
           v-model="isLive"
         />
       </div>
       <div class="control-item">
         <span class="toggle-label">Height (%)</span>
         <ev-input-number
           v-model="chartHeight"
           :step="10"
           :min="200"
           :max="300"
         />
       </div>
       <div class="control-item">
         <span class="toggle-label">데이터 업데이트 속도 증가</span>
         <ev-toggle
           v-model="isSpeedUpMode"
         />
       </div>
     </div>
    </div>
  </template>

<script>
  import { watch, ref, onBeforeUnmount, onMounted, reactive } from 'vue';
  import dayjs from 'dayjs';
  import EvInputNumber from '../../../../src/components/inputNumber/InputNumber';

  export default {
    components: {
      EvInputNumber,
    },
    setup() {
      const chartData = reactive({
        series: {
          series1: { name: 'series#1', point: false },
          series2: { name: 'series#2', point: false },
          series3: { name: 'series#3', point: false },
          series4: { name: 'series#4', point: false },
          series5: { name: 'series#5', point: false },
        },
        labels: [],
        data: {
          series1: [],
          series2: [],
          series3: [],
          series4: [],
          series5: [],
        },
      });
      const chartHeight = ref(250);
      const chartOptions = reactive({
        type: 'line',
        width: '100%',
        height: '100%',
        padding: {
          top: 20,
          right: 2,
          left: 2,
          bottom: 4,
        },
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'right',
        },
        axesX: [{
          type: 'time',
          timeFormat: 'DD HH:mm',
          interval: 'hour',
          formatter: (value, data) => {
            if (data?.prev) {
              const curr = dayjs(value).format('yy-MM-DD');
              const prev = dayjs(data?.prev).format('yy-MM-DD');
              if (curr === prev) {
                return dayjs(value)
                    .format('HH:mm');
              }
            }
            return dayjs(value)
                .format('DD HH:mm');
          },
          showAxisTick: true,
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: false,
          autoScaleRatio: 0.1,
          showAxisTick: true,
          niceScale: true,
        }],
      });
      const isLive = ref(false);
      const liveInterval = ref();
      const isSpeedUpMode = ref(false);

      let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');
      let maxTimeValue = dayjs(timeValue).add(2, 'day');
      let newMax = 100;
      let newMin = 0;

      const addRandomChartData = () => {
        if (isLive.value) {
          chartData.labels.shift();
        }
        timeValue = dayjs(timeValue).add(1, 'hour');
        chartData.labels.push(dayjs(timeValue));

        if (dayjs(timeValue).isAfter(maxTimeValue)) {
          // 범위를 랜덤하게 변경 (양수만 또는 음수 포함)
          const useNegativeRange = Math.random() < 0.5; // 50% 확률로 음수 범위 사용
          
          if (useNegativeRange) {
            // 음수 범위 포함: -100 ~ 0 같은 범위
            const range = Math.floor(Math.random() * (0 - (-100) + 1)) + (-100);
            newMin = -range;
            newMax = range;
          } else {
            // 양수 범위: 10 ~ 100
            newMax = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
            newMin = 0;

            if (Math.random() < 0.05) {
              const multiplier = Math.random() < 0.5 ? 0.1 : 10;
              newMax = Math.floor(newMax * multiplier);
              newMax = Math.max(10, Math.min(1000, newMax));
            }
          }

          maxTimeValue = dayjs(timeValue).add(3, 'day');
        }

        // 새로운 min/max 값에 맞춰 데이터 생성
        Object.values(chartData.data).forEach((seriesData) => {
          if (isLive.value) {
            seriesData.shift();
          }
          // newMin부터 newMax까지의 랜덤 값 생성
          const range = newMax - newMin;
          seriesData.push(Math.floor(Math.random() * (range + 1)) + newMin);
        });
      };
      onMounted(() => {
        for (let ix = 0; ix < 60; ix++) {
          addRandomChartData();
        }
      });
      watch(isLive, (newValue) => {
        if (newValue) {
          addRandomChartData();
          liveInterval.value = setInterval(addRandomChartData, isSpeedUpMode.value ? 100 : 1000);
        } else {
          clearInterval(liveInterval.value);
        }
      });
      watch(isSpeedUpMode, (newValue) => {
        if (isLive.value && newValue) {
          clearInterval(liveInterval.value);
          liveInterval.value = setInterval(addRandomChartData, newValue ? 100 : 1000);
        }
      });
      watch(chartHeight, (newValue) => {
        chartOptions.height = `${newValue}%`;
      });
      onBeforeUnmount(() => {
        clearInterval(liveInterval.value);
      });
      return {
        chartData,
        chartOptions,
        isLive,
        chartHeight,
        isSpeedUpMode,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .case {
    height: 100%;
  }
  .chart-container {
    height: 300px;
  }
  .description {
    display: flex;
    gap: 20px;
    margin-top: 10px;
    height: 55px;
  }
  .control-item {
    display: flex;
    align-items: center;
  }
  .toggle-label {
    vertical-align: top;
    margin-right: 7px;
  }
</style>
