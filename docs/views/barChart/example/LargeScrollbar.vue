<template>
  <ev-chart :data="chartData" :options="chartOptions" />
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const labelCount = ref(1000);
    const seriesCount = ref(100);

    // labelCount에 맞게 데이터 생성
    const generateData = (seriesIndex) => {
      const data = [];
      for (let i = 0; i < labelCount.value; i++) {
        // 간헐적으로 null, 음수, 양수 섞기
        const rand = Math.random();
        if (rand < 0.1) {
          // 10% 확률로 null
          data.push(null);
        } else if (rand < 0.2) {
          // 10% 확률로 음수
          data.push(Math.floor(Math.random() * -200) - 10);
        } else {
          // 80% 확률로 양수
          data.push(Math.floor(Math.random() * 300) + 10);
        }
      }
      return data;
    };

    // series 객체 동적 생성
    const series = {};
    const seriesKeys = [];
    for (let i = 1; i <= seriesCount.value; i++) {
      const key = `series${i}`;
      seriesKeys.push(key);
      series[key] = { name: `series#${i}`, showValue: { use: true } };
    }

    // data 객체 동적 생성
    const data = {};
    seriesKeys.forEach((key, index) => {
      data[key] = generateData(index);
    });

    const chartData = {
      series,
      groups: [seriesKeys],
      labels: Array.from({ length: labelCount.value }, (_, i) => `Label ${i + 1}`),
      data,
    };

    const chartOptions = {
      type: 'bar',
      width: '100%',
      height: '100%',
      title: {
        text: 'Title Test',
        show: true,
      },
      legend: {
        show: true,
        position: 'right',
      },
      horizontal: true,
      axesX: [
        {
          type: 'linear',
          startToZero: true,
          showGrid: false,
        },
      ],
      axesY: [
        {
          type: 'step',
          showGrid: false,
          labelStyle: {
            fitWidth: true,
            fitDir: 'left',
          },
          range: [0, 10],
          scrollbar: {
            use: true,
            showButton: true,
            resetPosition: true,
          },
        },
      ],
    };

    return {
      chartData,
      chartOptions,
    };
  },
};
</script>

<style lang="scss"></style>
