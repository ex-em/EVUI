<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" />
    </resizable-wrapper>
  </div>
  <div class="description">
    <span class="toggle-label">HTML Tooltip 사용</span>
    <ev-toggle v-model="useHtml" />
  </div>
</template>

<script>
import { onMounted, reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const SERIES_COUNT = 100;
    
    const chartData = reactive({
      series: Object.fromEntries(
        Array.from({ length: SERIES_COUNT }, (_, i) => {
          const seriesId = `series${i + 1}`;
          return [seriesId, { name: `series#${i + 1}`, point: false }];
        }),
      ),
      labels: [],
      data: Object.fromEntries(
        Array.from({ length: SERIES_COUNT }, (_, i) => {
          const seriesId = `series${i + 1}`;
          return [seriesId, []];
        }),
      ),
    });

    // 고객사 환경(고비용 value formatter; big.js 기반 단위 변환과 비슷한 부하)을 흉내내기 위해
    // 매 호출마다 약간의 산술/문자열 작업을 의도적으로 끼워 넣는다.
    const heavyFormatNumber = (n) => {
      let x = Number(n);
      // 일부러 비싼 path: 자릿수 분해 + 단위 변환 시늉
      let scaled = x;
      const units = ['', 'K', 'M', 'G', 'T'];
      let uIdx = 0;
      while (Math.abs(scaled) >= 1000 && uIdx < units.length - 1) {
        scaled /= 1000;
        uIdx += 1;
      }
      const fixed = scaled.toFixed(4);
      // 천 단위 콤마
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      // 부동소수 약간의 추가 연산
      const noise = Math.sqrt(Math.abs(x) + 1) * Math.log(Math.abs(x) + 2);
      return `${parts.join('.')} ${units[uIdx]} (~${noise.toFixed(2)})`;
    };

    const useHtml = ref(true);
    const htmlTooltipFormatter = {
      // 고객사처럼 value formatter 도 함께 사용 — findHitItem 루프에서 시리즈마다 호출됨
      value: ({ y }) => heavyFormatNumber(y),
      html: (seriesList) => {
        let result = '<div class="ev-chart-tooltip-custom" style="width: 320px">';
        result += `<div class="ev-chart-tooltip-custom__header"> ${dayjs(seriesList?.[0]?.data?.x).format('mm:ss')}</div>`;
        result += '<div class="ev-chart-tooltip-custom__body">';
        seriesList.forEach((series) => {
          // 가상 스크롤(자동 활성)을 위해 시리즈당 wrapper에 data-evui-tooltip-row 마커를 부여한다.
          const arr = chartData.data[series?.sId] || [];
          const sum = arr.reduce((a, b) => a + b, 0);
          const avg = arr.length ? sum / arr.length : 0;
          let min = Infinity;
          let max = -Infinity;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i] < min) min = arr[i];
            if (arr[i] > max) max = arr[i];
          }
          result += '<div data-evui-tooltip-row>';
          result += '<br/>';
          result += '<div class="row">';
          result += `<div class="color-circle" style="background-color: ${series.color}"></div>`;
          result += `<div class="series-name">${series.name} 값 </div>`;
          result += `<div class="value">${heavyFormatNumber(series.data?.y)}</div>`;
          result += '</div>';
          result += '<div class="row">';
          result += `<div class="color-circle" style="background-color: ${series.color}"></div>`;
          result += '<div class="series-name">합계 </div>';
          result += `<div class="value">${heavyFormatNumber(sum)}</div>`;
          result += '</div>';
          result += '<div class="row">';
          result += `<div class="color-circle" style="background-color: ${series.color}"></div>`;
          result += '<div class="series-name">평균 </div>';
          result += `<div class="value">${heavyFormatNumber(avg)}</div>`;
          result += '</div>';
          result += '<div class="row">';
          result += `<div class="color-circle" style="background-color: ${series.color}"></div>`;
          result += `<div class="series-name">min / max </div>`;
          result += `<div class="value">${heavyFormatNumber(min)} / ${heavyFormatNumber(max)}</div>`;
          result += '</div>';
          result += '</div>';
        });

        result += '</div></div>';
        return result;
      },
    };

    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      height: '100%',
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
          timeFormat: 'HH:mm:ss',
          interval: 'second',
        },
      ],
      axesY: [
        {
          type: 'linear',
          showGrid: true,
          autoScaleRatio: 0.1,
        },
      ],
      tooltip: {
        use: true,
        useScrollbar: true,
        htmlScrollTarget: '.ev-chart-tooltip-custom__body',
      },
    });

    watch(
      useHtml,
      () => {
        if (useHtml.value) {
          chartOptions.tooltip.formatter = htmlTooltipFormatter;
        } else {
          chartOptions.tooltip.formatter = null;
        }
      },
      {
        immediate: true,
      },
    );

    let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const addRandomChartData = () => {
      timeValue = dayjs(timeValue).add(1, 'second');
      chartData.labels.push(dayjs(timeValue));

      Object.values(chartData.data).forEach((seriesData) => {
        seriesData.push(Math.floor(Math.random() * 10) + 1);
      });
    };

    onMounted(() => {
      for (let ix = 0; ix < 60; ix++) {
        addRandomChartData();
      }
    });

    return {
      chartData,
      chartOptions,
      useHtml,
    };
  },
};
</script>

<style lang="scss">
.ev-chart-tooltip-custom__body {
  max-height: 400px;
  overflow-y: auto !important;
}
</style>
