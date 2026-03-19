<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart :data="chartData" :options="chartOptions" />
    </resizable-wrapper>
  </div>

  <div class="description">
    <div class="row">
      <div class="row-item">
        <span class="item-title">
          show maxTip
        </span>
        <ev-toggle
          v-model="showMaxTip"
          class="component"
        />
      </div>
    </div>
    <div class="row">
      <h3> YAxis Options</h3>
    </div>
    <div class="row">
      <div class="row-item">
        <span class="item-title">
          use Range
        </span>
        <ev-toggle
          v-model="useRange"
          class="component"
        />
      </div>
      <div class="row-item">
        <span class="item-title">
          Min Value
        </span>
        <ev-input-number
          v-model="minValue"
          class="component"
          :disabled="!useRange"
        />
      </div>
      <div class="row-item">
        <span class="item-title">
          Max Value
        </span>
        <ev-input-number
          v-model="maxValue"
          class="component"
          :disabled="!useRange"
        />
      </div>
    </div>
    <div class="row">
      <div class="row-item">
        <span class="item-title">
          use Fixed Steps
        </span>
        <ev-toggle
          v-model="useFixedSteps"
          class="component"
        />
      </div>
        <div class="row-item">
          <span class="item-title">
            use Interval
          </span>
          <ev-toggle
            v-model="useInterval"
            class="component"
          />
        </div>
        <div class="row-item">
          <span class="item-title">
            Interval
          </span>
          <ev-input-number
            v-model="interval"
            class="component"
            :min="0"
            :disabled="!useInterval"
          />
        </div>
      </div>
      <div class="row">
        <div class="sub-description">
          fixedSteps 옵션이 false일 때, range 옵션과 interval 옵션이 호환되지 않는다면 interval 옵션은 무시됩니다.
        </div>
      </div>
      <div class="row">
        <div class="row-item">
          <span class="item-title">
            is Auto Decimal
          </span>
          <ev-toggle
            v-model="isAutoDecimal"
            class="component"
          />
        </div>
        <div class="row-item">
          <span class="item-title">
            Decimal Point
          </span>
          <ev-input-number
            v-model="decimalPoint"
            class="component"
            :disabled="isAutoDecimal"
            :min="0"
          />
        </div>
      </div>
  </div>

</template>

<script>
import { ref, computed } from 'vue';

export default {
  setup() {
    const chartData = {
      series: {
        series1: { name: '시리즈 이름' },
      },
      labels: ['가나다라', '마바사', '아자차', '카타', '파하'],
      data: {
        series1: [4, -2, 5, 1, -3],
      },
    };

    const maxValue = ref(10);
    const minValue = ref(-3);
    const decimalPoint = ref(0);
    const isAutoDecimal = ref(true);
    const interval = ref(5);
    const useInterval = ref(false);
    const useRange = ref(true);
    const useFixedSteps = ref(false);
    const showMaxTip = ref(false);

    const chartOptions = computed(() => ({
      type: 'bar',
      cPadRatio: 0.1,
      thickness: 1,
      axesX: [
        {
          type: 'step',
          showAxisTick: true,
          axisLineColor: '#25262E',
        },
      ],
      axesY: [
        {
          showAxis: true,
          type: 'linear',
          autoScaleRatio: 0.1,
          showAxisTick: true,
          startToZero: true,
          axisLineColor: '#25262E',
          decimalPoint: isAutoDecimal.value ? 'auto' : decimalPoint.value,
          range: useRange.value ? [minValue.value, maxValue.value] : null,
          interval: useInterval.value ? interval.value : null,
          useNiceScale: false,
          fixedSteps: useFixedSteps.value,
        },
      ],
      maxTip: {
        use: showMaxTip.value,
        showTextTip: true,
        tipStyle: {
          background: '#FF0000',
        },
      },
    }));

    return {
      chartData,
      chartOptions,
      maxValue,
      minValue,
      decimalPoint,
      isAutoDecimal,
      interval,
      useInterval,
      useRange,
      useFixedSteps,
      showMaxTip,
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
      min-width: 80px;
      text-align: right;
      white-space: nowrap;
    }

    .component {
      max-width: 200px;
    }
  }

  .sub-description {
      font-size: 12px;
      color: #666;
      text-align: right;
    }
}
</style>
