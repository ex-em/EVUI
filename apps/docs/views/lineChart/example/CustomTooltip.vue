<template>
  <div class="case">
    <ev-chart
        :data="chartData"
        :options="chartOptions"
    />
    <div class="description">
      <span class="toggle-label">HTML Tooltip 사용</span>
      <ev-toggle
          v-model="useHtml"
      />
    </div>
  </div>

</template>

<script>
import { onMounted, reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const chartData = reactive({
      series: {
        series1: { name: 'series#1', point: false },
        series2: { name: 'series#2', point: false },
        series3: { name: 'series#3', point: false },
      },
      labels: [],
      data: {
        series1: [],
        series2: [],
        series3: [],
      },
    });

    const useHtml = ref(true);
    const htmlTooltipFormatter = {
      html: (seriesList) => {
        let result = '<div class="ev-chart-tooltip-custom" style="width: 250px">';
        result += `<div class="ev-chart-tooltip-custom__header"> ${dayjs(seriesList?.[0]?.data?.x).format('mm:ss')}</div>`;
        result += '<div class="ev-chart-tooltip-custom__body">';
        seriesList.forEach((series) => {
          result += '<br/>';
          result += '<div class="row">';
          result += `<div class="color-circle" style="background-color: ${series.color}"></div>`;
          result += `<div class="series-name">${series.name} 값 </div>`;
          result += `<div class="value">${series.data?.y}</div>`;
          result += '</div>';
          result += '<div class="row">';
          result += `<div class="color-circle" style="background-color: ${series.color}"></div>`;
          result += '<div class="series-name">전체 합계 </div>';
          result += `<div class="value">${chartData.data[series?.sId].reduce((a, b) => a + b, 0)}</div>`;
          result += '</div>';
        });

        result += '</div></div>';
        return result;
      },
    };

    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      height: '80%',
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
        timeFormat: 'HH:mm:ss',
        interval: 'second',
      }],
      axesY: [{
        type: 'linear',
        showGrid: true,
        autoScaleRatio: 0.1,
      }],
      tooltip: {
        use: true,
      },
    });

    watch(useHtml, () => {
      if (useHtml.value) {
        chartOptions.tooltip.formatter = htmlTooltipFormatter;
      } else {
        chartOptions.tooltip.formatter = null;
      }
    }, {
      immediate: true,
    });

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
