<template>
  <div
    ref="zoomRef"
    class="case"
  >
    <ev-chart
      v-model:zoomStartIdx="zoomStartIdx"
      v-model:zoomEndIdx="zoomEndIdx"
      :data="chartData"
      :options="chartOptions"
    />

    <div class="description">
      <p class="case-title">줌 Start / End 인덱스 조절 (줌 모드에서 사용 가능)</p>
      <div class="input-wrapper">
        <ev-input-number
          v-model="zoomStartIdx"
        />
        <ev-input-number
          v-model="zoomEndIdx"
        />
      </div>
      <p class="case-title">줌 버퍼 메모리</p>
      <ev-input-number
        v-model="bufferMemoryCnt"
        :min="1"
        :max="1000"
      />
      <br/>
      <br/>
      <ev-button @click="onUpdateChartData">데이터 업데이트</ev-button>
      <br/>
      <br/>
      <span class="toggle-label">툴바 생성</span>
      <ev-toggle v-model="isShowToolbar"/>
      <br/>
      <br/>
      <span class="toggle-label">토글 레전드</span>
      <ev-toggle v-model="isShowToggleLegend"/>
      <br/>
      <br/>
      <span class="toggle-label">차트 넓히기</span>
      <ev-toggle v-model="isExpandChartArea"/>
    </div>
  </div>
</template>

<script>
import { onMounted, reactive, ref, watch } from 'vue';
import dayjs from 'dayjs';

export default {
  setup() {
    const isShowToggleLegend = ref(false);
    const isExpandChartArea = ref(false);
    const isShowToolbar = ref(true);
    const bufferMemoryCnt = ref(10);
    const zoomStartIdx = ref(0);
    const zoomEndIdx = ref(0);
    const zoomRef = ref();
    let timeValue = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const chartData = reactive({
      series: {
        series11: { name: 'series#11' },
        series22: { name: 'series#22' },
      },
      labels: [],
      data: {
        series11: [],
        series22: [],
      },
    });

    const chartOptions = reactive({
      type: 'line',
      width: '100%',
      title: {
        text: 'Chart Title1',
        show: true,
      },
      legend: {
        show: false,
        position: 'right',
      },
      axesX: [{
        type: 'time',
        showGrid: false,
        timeFormat: 'HH:mm:ss',
        interval: 'second',
      }],
      axesY: [{
        type: 'linear',
        showGrid: false,
        startToZero: true,
        autoScaleRatio: 0.1,
      }],
      zoom: {
        bufferMemoryCnt: 5,
        toolbar: {
          show: isShowToolbar,
          items: {
            previous: {
              icon: 'ev-icon-allow2-left',
              size: 'medium',
              title: 'Previous',
            },
            latest: {
              icon: 'ev-icon-allow2-right',
              size: 'medium',
              title: 'Latest',
            },
            reset: {
              icon: 'ev-icon-redo',
              size: 'medium',
              title: 'Reset',
            },
            dragZoom: {
              icon: 'ev-icon-zoomin',
              size: 'medium',
              title: 'Drag Zoom',
            },
          },
        },
      },
    });

    const addRandomChartData = () => {
      timeValue = dayjs(timeValue).add(1, 'second');
      chartData.labels.push(dayjs(timeValue));

      Object.values(chartData.data).forEach((seriesData) => {
        seriesData.push(Math.floor(Math.random() * ((5000 - 5) + 1)) + 5);
      });
    };

    onMounted(() => {
      for (let ix = 0; ix < Math.ceil(Math.random() * 100); ix++) {
        addRandomChartData();
      }
    });

    const onUpdateChartData = () => {
      const init = (data) => {
        data.labels.length = 0;
        const seriesKeyArr = Object.keys(data.data);

        for (let i = 0; i < seriesKeyArr.length; i++) {
          const series = seriesKeyArr[i];

          data.data[series].length = 0;
        }
      };

      init(chartData);

      for (let ix = 0; ix < Math.ceil(Math.random() * 100); ix++) {
        addRandomChartData();
      }
    };

    watch(isShowToggleLegend, (isShow) => {
      chartOptions.legend.show = isShow;
    });

    watch(isExpandChartArea, (isExpand) => {
      const viewElement = zoomRef.value.parentElement;

      if (isExpand) {
        viewElement.style.width = '100%';
        viewElement.nextSibling.style.display = 'none';
      } else {
        viewElement.style.width = '50%';
        viewElement.nextSibling.style.display = 'initial';
      }
    });

    watch(bufferMemoryCnt, (cnt) => {
      chartOptions.zoom.bufferMemoryCnt = cnt;
    }, { immediate: true });

    return {
      chartData,
      chartOptions,
      isShowToggleLegend,
      isExpandChartArea,
      zoomRef,
      zoomStartIdx,
      zoomEndIdx,
      bufferMemoryCnt,
      isShowToolbar,
      onUpdateChartData,
    };
  },
};
</script>

<style lang="scss" scoped>
.input-wrapper {
  display: flex;

  .ev-input-number {
    width: 100%;
  }
}
</style>
