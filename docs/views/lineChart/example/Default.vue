<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" />
    </resizable-wrapper>
  </div>
  <div class="description">
    <span class="toggle-label">데이터 자동 업데이트</span>
    <ev-toggle v-model="isLive" />
  </div>
</template>

<script>
import { watch, ref, onBeforeUnmount, onMounted, reactive } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const chartData = reactive({
      series: {
        series1: { name: '정수', point: false },
        series2: { name: '소수점 2자리', point: false },
        series3: { name: '소수점 3자리', point: false },
        series4: { name: '소수점 4자리', point: false },
        series5: { name: '소수점 5자리', point: false },
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
      axesX: [
        {
          type: 'time',
          timeFormat: 'DD HH:mm',
          interval: { time: 1, unit: 'hour' },
          formatter: (value, data) => {
            if (data?.prev) {
              const curr = dayjs(value).format('yy-MM-DD');
              const prev = dayjs(data?.prev).format('yy-MM-DD');
              if (curr === prev) {
                return dayjs(value).format('HH:mm');
              }
            }

            return dayjs(value).format('DD HH:mm');
          },
          showAxisTick: true,
          axisLineColor: '#25262E',
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          startToZero: true,
          decimalPoint: 'auto',
          autoScaleRatio: 0.1,
          showAxisTick: true,
          axisLineColor: '#25262E',
          formatter: (value) => `${value}%`,
        },
      ],
    });

    const isLive = ref(false);
    const liveInterval = ref();
    let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const addRandomChartData = () => {
      if (isLive.value) {
        chartData.labels.shift();
      }

      timeValue = dayjs(timeValue).add(1, 'hour');
      chartData.labels.push(dayjs(timeValue));

      Object.values(chartData.data).forEach((seriesData, sIndex) => {
        if (isLive.value) {
          seriesData.shift();
        }

        if (Math.random() < 0.1) {
          seriesData.push(null);
        } else if (sIndex === 0) {
          seriesData.push(Math.random() * 10000);
        } else if (sIndex === 1) {
          seriesData.push(Math.random() * 0.1);
        } else if (sIndex === 2) {
          seriesData.push(Math.random() * 0.01);
        } else if (sIndex === 3) {
          seriesData.push(Math.random() * 0.001);
        } else {
          seriesData.push(Math.random() * 0.0001);
        }
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
        liveInterval.value = setInterval(addRandomChartData, 1000);
      } else {
        clearInterval(liveInterval.value);
      }
    });

    onBeforeUnmount(() => {
      clearInterval(liveInterval.value);
    });

    return {
      chartData,
      chartOptions,
      isLive,
    };
  },
};
</script>

<style lang="scss" scoped>
.toggle-label {
  vertical-align: top;
  margin-right: 7px;
}
</style>
