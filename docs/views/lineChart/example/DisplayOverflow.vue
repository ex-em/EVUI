<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" />
    </resizable-wrapper>
    <div class="description">
      <div class="row">
        <div class="row-item">
          <span class="item-title">Display Overflow</span>
          <ev-toggle v-model="displayOverflow" class="component" />
        </div>
        <div class="row-item">
          <span class="item-title">X축 range [2, 6]</span>
          <ev-toggle v-model="useXRange" class="component" />
        </div>
      </div>
      <p class="sub-description">
        Y축 <code>range: [0, 100]</code>로 값 범위를 제한했습니다. 값이 100을 초과하는 데이터는
        <code>displayOverflow: false</code>면 숨겨지고, <code>true</code>면 상단 경계에 모아 표시됩니다.
        <br />
        <strong>X축 range</strong>를 켜면 <code>[2, 6]</code> 밖의 데이터(라벨 1, 7, 8)는
        <code>displayOverflow</code>와 <strong>무관하게 항상 숨겨집니다</strong>.
        displayOverflow는 값 축(Y)에만 적용되고 X축은 clamp하지 않기 때문입니다.
      </p>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';

export default {
  setup() {
    const displayOverflow = ref(true);
    const useXRange = ref(false);

    const chartData = reactive({
      series: {
        series1: { name: 'series#1', point: true },
      },
      labels: [1, 2, 3, 4, 5, 6, 7, 8],
      data: {
        // 일부 값(150, 220, 180)이 Y range(0~100)를 초과 → overflow 대상
        series1: [40, 80, 150, 60, 220, 70, 180, 50],
      },
    });

    const chartOptions = computed(() => ({
      type: 'line',
      width: '100%',
      height: '100%',
      displayOverflow: displayOverflow.value,
      title: { show: true, text: 'Line displayOverflow' },
      maxTip: { use: true },
      tooltip: { use: true },
      axesX: [{ type: 'linear', ...(useXRange.value ? { range: [2, 6] } : {}) }],
      axesY: [
        {
          type: 'linear',
          range: [0, 100],
          startToZero: true,
        },
      ],
    }));

    return {
      chartData,
      chartOptions,
      displayOverflow,
      useXRange,
    };
  },
};
</script>

<style lang="scss" scoped>
.case {
  height: 100%;
}
.description {
  margin-top: 10px;
  font-size: 13px;
}
.row {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 8px;
}
.row-item {
  display: flex;
  gap: 8px;
  align-items: center;
}
.item-title {
  font-weight: 500;
}
.sub-description {
  color: #666;
  line-height: 1.6;

  code {
    background: #f5f5f5;
    padding: 1px 5px;
    border-radius: 3px;
  }
}
</style>
