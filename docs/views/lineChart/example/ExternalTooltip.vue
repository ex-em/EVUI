<template>
  <div class="case" @mouseleave="hideExternalTooltip" @wheel="onReplaceScroll">
    <ev-chart :data="chartData" :options="chartOptions" />

    <div
      v-show="tooltip.items.length"
      class="ev-chart-tooltip"
      :style="{
        position: 'fixed',
        left: `${tooltip.x + 12}px`,
        top: `${tooltip.y + 12}px`,
      }"
    >
      <div class="ev-chart-tooltip-custom">
        <div class="ev-chart-tooltip-custom__header">
          {{
            typeof tooltip.time === 'number' || typeof tooltip.time === 'string'
              ? tooltip.time
              : tooltip.time
          }}
        </div>
        <div class="ev-chart-tooltip-custom__body">
          <div
            v-for="s in tooltip.items"
            :key="s.sId + ':' + s.index"
            class="row"
          >
            <span class="color-circle" :style="{ backgroundColor: s.color }" />
            <span class="series-name">{{ s.name }}</span>
            <span class="value">{{ s.data?.y }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, reactive } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const chartData = reactive({
      series: Object.fromEntries(
        Array.from({ length: 100 }, (_, i) => {
          const seriesId = `series${i + 1}`;
          return [seriesId, { name: `series#${i + 1}`, point: false }];
        }),
      ),
      labels: [],
      data: Object.fromEntries(
        Array.from({ length: 100 }, (_, i) => {
          const seriesId = `series${i + 1}`;
          return [seriesId, []];
        }),
      ),
    });

    const tooltip = reactive({ show: false, x: 0, y: 0, time: '', items: [] });

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
        returnValue: (seriesList, e) => {
          tooltip.items = seriesList;
          tooltip.x = e.clientX;
          tooltip.y = e.clientY;
          tooltip.time = dayjs(seriesList?.[0]?.data?.x).format('HH:mm:ss');
          tooltip.show = true;
        },
      },
    });

    let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const addRandomChartData = () => {
      timeValue = dayjs(timeValue).add(1, 'second');
      chartData.labels.push(dayjs(timeValue));

      Object.values(chartData.data).forEach((seriesData) => {
        seriesData.push(Math.floor(Math.random() * 10) + 1);
      });
    };

    const onReplaceScroll = (e) => {
      const scrollElement = document.querySelector(
        '.ev-chart-tooltip-custom__body',
      );

      if (scrollElement && scrollElement.scrollHeight > scrollElement.clientHeight) {
        e.preventDefault();

        if (scrollElement) {
          scrollElement.scrollTop += e.deltaY;
        }
      }
    };

    onMounted(() => {
      for (let ix = 0; ix < 60; ix++) {
        addRandomChartData();
      }
    });

    const hideExternalTooltip = () => {
      tooltip.show = false;
    };

    return {
      chartData,
      chartOptions,
      tooltip,
      onReplaceScroll,
      hideExternalTooltip,
    };
  },
};
</script>

<style lang="scss" scoped>
.ev-chart-tooltip {
  background-color: rgb(76, 76, 76);
  border: 1px solid rgb(102, 102, 102);
  color: #FFFFFF;

  &__body {
    max-height: 400px;
    overflow-y: auto !important;
  }
}
</style>
