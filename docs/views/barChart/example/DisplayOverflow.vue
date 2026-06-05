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
          <span class="item-title">가로 모드(horizontal)</span>
          <ev-toggle v-model="horizontal" class="component" />
        </div>
      </div>
      <p class="sub-description">
        값 축 <code>range: [0, 100]</code>로 막대 길이 범위를 제한했습니다. 값이 100을 초과하는
        막대는 <code>displayOverflow: false</code>면 숨겨지고, <code>true</code>면 경계까지 표시됩니다.
        <br />
        <strong>가로 모드</strong>를 켜면 값 축이 X로 바뀌며, displayOverflow는 값 축(가로=X,
        세로=Y)을 따라 동일하게 동작합니다.
      </p>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';

export default {
  setup() {
    const displayOverflow = ref(true);
    const horizontal = ref(false);

    const chartData = reactive({
      series: {
        series1: { name: 'series#1' },
      },
      labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      data: {
        // 일부 값(150, 220, 180)이 값 축 range(0~100)를 초과 → overflow 대상
        series1: [40, 80, 150, 60, 220, 70, 180, 50],
      },
    });

    const chartOptions = computed(() => {
      // 값 축은 linear + range, 카테고리 축은 step.
      // 가로 모드면 값 축 = X, 카테고리 = Y / 세로 모드면 값 축 = Y, 카테고리 = X.
      const valueAxis = { type: 'linear', range: [0, 100], startToZero: true };
      const categoryAxis = { type: 'step' };

      return {
        type: 'bar',
        width: '100%',
        height: '100%',
        horizontal: horizontal.value,
        displayOverflow: displayOverflow.value,
        title: { show: true, text: 'Bar displayOverflow' },
        maxTip: { use: true },
        tooltip: { use: true },
        axesX: [horizontal.value ? valueAxis : categoryAxis],
        axesY: [horizontal.value ? categoryAxis : valueAxis],
      };
    });

    return {
      chartData,
      chartOptions,
      displayOverflow,
      horizontal,
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
