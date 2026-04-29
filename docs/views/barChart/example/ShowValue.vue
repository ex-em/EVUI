<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" />
    </resizable-wrapper>
  </div>
  <div class="description">
    <div class="row">
      <div class="row-item">
        <span class="item-title">Horizontal</span>
        <ev-toggle v-model="isHorizontal" class="component" />
      </div>
      <div class="row-item">
        <span class="item-title">Include Negative</span>
        <ev-toggle v-model="useNegative" class="component" />
      </div>
    </div>
    <div class="row">
      <div class="row-item">
        <span class="item-title">align</span>
        <ev-select v-model="align" :items="alignItems" class="component" />
      </div>
      <div class="row-item">
        <span class="item-title">fontSize</span>
        <ev-input-number v-model="fontSize" :min="8" :max="30" class="component" />
      </div>
      <div class="row-item">
        <span class="item-title">thickness</span>
        <ev-input-number
          v-model="thickness"
          :min="0.1"
          :max="1"
          :step="0.1"
          class="component"
        />
      </div>
    </div>
    <div class="row hint">
      <span>
        series1: [1500, 200, 30, 5, 0] &nbsp;/&nbsp;
        series2 (negative on): [-800, -150, -20, -3, 0]
      </span>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  setup() {
    const isHorizontal = ref(false);
    const useNegative = ref(false);
    const align = ref('out');
    const fontSize = ref(12);
    const thickness = ref(0.8);

    const alignItems = [
      { name: 'start', value: 'start' },
      { name: 'center', value: 'center' },
      { name: 'out', value: 'out' },
      { name: 'end', value: 'end' },
    ];

    const numFormatter = (value) => {
      const abs = Math.abs(value);
      const sign = value < 0 ? '-' : '';
      if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}K`;
      return `${sign}${abs}`;
    };

    const showValueOption = computed(() => ({
      use: true,
      fontSize: fontSize.value,
      align: align.value,
    }));

    const labels = ['Large', 'Medium', 'Small', 'Tiny', 'Zero'];

    const chartData = computed(() => ({
      series: {
        series1: {
          name: 'Series #1',
          showValue: showValueOption.value,
        },
        series2: {
          name: 'Series #2',
          showValue: showValueOption.value,
        },
      },
      labels,
      data: {
        series1: [1500, 200, 30, 5, 0],
        series2: useNegative.value ? [-800, -150, -20, -3, 0] : [800, 150, 20, 3, 0],
      },
    }));

    const stepAxes = computed(() => [
      {
        type: 'step',
        showGrid: true,
      },
    ]);

    const linearAxes = computed(() => [
      {
        type: 'linear',
        startToZero: !useNegative.value,
        autoScaleRatio: 0.2,
        showGrid: true,
      },
    ]);

    const chartOptions = computed(() => ({
      type: 'bar',
      thickness: thickness.value,
      horizontal: isHorizontal.value,
      axesX: isHorizontal.value ? linearAxes.value : stepAxes.value,
      axesY: isHorizontal.value ? stepAxes.value : linearAxes.value,
    }));

    return {
      isHorizontal,
      useNegative,
      align,
      fontSize,
      thickness,
      alignItems,
      chartData,
      chartOptions,
    };
  },
};
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  flex-direction: row;
  margin-top: 15px;
  gap: 10px;

  .row-item {
    display: flex;
    align-items: center;
    gap: 3px;

    .item-title {
      line-height: 33px;
      margin-right: 3px;
      min-width: 110px;
      text-align: right;
      white-space: nowrap;
    }

    .component {
      max-width: 200px;
    }
  }

  &.hint {
    font-size: 12px;
    color: #888;
    margin-top: 8px;
  }
}
</style>
