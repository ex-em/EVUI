<template>
  <div class="legend-virtual-scroll-test">
    <div class="test-controls">
      <button @click="toggleLegend">
        범례 {{ chartOptions.legend.show ? 'Off' : 'On' }}
      </button>
      <button @click="changeSeries">
        시리즈 변경
      </button>
      <span class="test-status">
        시리즈 개수: {{ seriesCount }} | 이름 패턴: {{ namePattern }}
      </span>
    </div>
    <div class="test-instructions">
      <p><strong>버그 재현 방법:</strong></p>
      <ol>
        <li>"범례 Off" 버튼 클릭 (범례 숨김)</li>
        <li>"시리즈 변경" 버튼 클릭</li>
        <li>"범례 On" 버튼 클릭 (범례 다시 표시)</li>
        <li>결과 확인: 범례 영역은 있지만 데이터가 없는지 확인</li>
      </ol>
    </div>
    <ev-chart
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script>
  import { ref } from 'vue';
  import dayjs from 'dayjs';

  export default {
    setup() {
      const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const seriesCount = ref(100);
      const namePattern = ref('series');

      const generateChartData = (count, pattern) => (
        {
          series: Array(count).fill(0).reduce((acc, _, idx) => {
            const seriesId = `${pattern}${idx + 1}`;
            acc[seriesId] = { name: `${pattern}#${idx + 1}`, fill: true, point: true };
            return acc;
          }, {}),
          groups: [Array(count).fill(0).map((_, idx) => `${pattern}${idx + 1}`)],
          labels: Array(10).fill(0).map((_, index) => dayjs(time).add(index, 'day')),
          data: Array(count).fill(0).reduce((acc, _, idx) => {
            acc[`${pattern}${idx + 1}`] = Array(10).fill(0).map(() => Math.floor(Math.random() * 100));
            return acc;
          }, {}),
        }
      );

      const chartData = ref(generateChartData(seriesCount.value, namePattern.value));

      const chartOptions = ref({
        type: 'line',
        width: '100%',
        title: {
          text: 'Chart Title',
          show: true,
        },
        legend: {
          show: true,
          position: 'bottom',
          virtualScroll: true,
        },
        tooltip: {
          use: true,
        },
        axesX: [{
          type: 'time',
          showGrid: false,
          timeFormat: 'MM/DD',
          interval: 'day',
          labelStyle: {
            color: '#A4A4A4',
            fontSize: '11px',
            fontFamily: 'Roboto',
          },
        }],
        axesY: [{
          type: 'linear',
          showGrid: true,
          startToZero: true,
          autoScaleRatio: 0.1,
          labelStyle: {
            color: '#A4A4A4',
            fontSize: '11px',
            fontFamily: 'Roboto',
          },
        }],
      });

      const toggleLegend = () => {
        chartOptions.value = {
          ...chartOptions.value,
          legend: {
            ...chartOptions.value.legend,
            show: !chartOptions.value.legend.show,
          },
        };
      };

      const changeSeries = () => {
        // 시리즈 이름 패턴만 변경하여 새로운 데이터 생성 (개수는 유지)
        namePattern.value = namePattern.value === 'series' ? 'changed-series' : 'series';
        chartData.value = generateChartData(seriesCount.value, namePattern.value);
      };

      return {
        chartData,
        chartOptions,
        seriesCount,
        namePattern,
        toggleLegend,
        changeSeries,
      };
    },
  };
</script>

<style lang="scss">
.legend-virtual-scroll-test {
  .test-controls {
    display: flex;
    gap: 10px;
    padding: 10px;
    align-items: center;
    margin-bottom: 10px;
    background-color: #F5F5F5;
    border-radius: 4px;

    button {
      padding: 8px 16px;
      border: 1px solid #CCCCCC;
      border-radius: 4px;
      background-color: #FFFFFF;
      cursor: pointer;

      &:hover {
        background-color: #E0E0E0;
      }
    }

    .test-status {
      margin-left: auto;
      font-size: 14px;
      color: #666666;
    }
  }

  .test-instructions {
    padding: 10px;
    margin-bottom: 10px;
    background-color: #FFF3CD;
    border: 1px solid #FFC107;
    border-radius: 4px;
    font-size: 13px;

    p {
      margin: 0 0 8px 0;
    }

    ol {
      margin: 0;
      padding-left: 20px;
    }
  }
}
</style>
