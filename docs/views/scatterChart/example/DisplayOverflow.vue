<template>
  <div class="case">
    <resizable-wrapper>
      <ev-chart
        :data="chartData"
        :options="chartOptions"
      />
    </resizable-wrapper>

    <div class="description">
      <div class="row">
        <div class="row-item">
          <span class="item-title">
            Display Overflow
          </span>
          <ev-checkbox
            v-model="displayOverflow"
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
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import EvCheckbox from '@/components/checkbox/Checkbox';

export default {
  components: { EvCheckbox },
  setup() {
    const chartData = reactive({
      series: {
        series1: { name: 'series#1' },
        series2: { name: 'series#2' },
      },
      data: {
        series1: [
          { x: 134, y: 51 }, { x: 67, y: 59 }, { x: 19, y: 49 },
          { x: 15, y: 63 }, { x: 55, y: 53 }, { x: 161, y: 51 },
          { x: 167, y: 59 }, { x: 159, y: 49 }, { x: 157, y: 63 },
          { x: 155, y: 53 }, { x: 170, y: 59 }, { x: 159, y: 47 },
          { x: 166, y: 69 }, { x: 176, y: 66 }, { x: 160, y: 75 },
          { x: 172, y: 55 }, { x: 170, y: 54 }, { x: 172, y: 62 },
          { x: 153, y: 42 }, { x: 160, y: 50 }, { x: 147, y: 49 },
          { x: 168, y: 49 }, { x: 175, y: 73 }, { x: 157, y: 47 },
          { x: 167, y: 68 }, { x: 159, y: 50 }, { x: 175, y: 82 },
          { x: 166, y: 57 }, { x: 176, y: 87 }, { x: 170, y: 72 },
        ],
        series2: [
          { x: 9, y: 51 }, { x: 72, y: 59 }, { x: 0, y: 49 },
          { x: 57, y: 63 }, { x: 15, y: 53 }, { x: 174, y: 65 },
          { x: 175, y: 71 }, { x: 200, y: 80, color: '#FF0000' }, { x: 186, y: 72 },
          { x: 187, y: 78 }, { x: 181, y: 74 }, { x: 184, y: 86 },
          { x: 184, y: 78 }, { x: 175, y: 62 }, { x: 184, y: 81 },
          { x: 180, y: 76 }, { x: 177, y: 83 }, { x: 192, y: 90, color: '#FF0000' },
          { x: 176, y: 74 }, { x: 174, y: 71 }, { x: 184, y: 79 },
          { x: 10, y: 4, color: '#FF0000' }, { x: 171, y: 70 }, { x: 173, y: 72 },
          { x: 176, y: 85 }, { x: 176, y: 78 }, { x: 180, y: 77 },
          { x: 172, y: 66 }, { x: 176, y: 86 }, { x: 173, y: 81 },
        ],
      },
    });

    const maxValue = ref(10);
    const minValue = ref(0);
    const decimalPoint = ref(0);
    const isAutoDecimal = ref(true);
    const displayOverflow = ref(true);
    const interval = ref(5);
    const useInterval = ref(false);
    const useRange = ref(true);
    const useFixedSteps = ref(false);
    
    const chartOptions = computed(() => ({
      type: 'scatter',
      width: '100%',
      height: '100%',
      padding: { top: 20, right: 2, bottom: 4, left: 2 },
      axesX: [
        {
          type: 'linear',
        }],
        axesY: [{
          type: 'linear',
          startToZero: true,
          decimalPoint: isAutoDecimal.value ? 'auto' : decimalPoint.value,
          range: useRange.value ? [minValue.value, maxValue.value] : null,
          interval: useInterval.value ? interval.value : null,
          fixedSteps: useFixedSteps.value,
          lastLabelFontStyle: useRange.value ? {
            color: '#FF0000',
            fontSize: 16,
            fontWeight: 600,
          } : undefined,
        }],
        title: {
          text: '',
          show: false,
        },
        legend: {
          show: false,
          position: 'right',
          color: '#353740',
          inactive: '#aaa',
          width: 140,
          height: 24,
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
        },
        tooltip: {
          use: false,
        },
        selectItem: {
          use: false,
        },
        dragSelection: {
          use: false,
          keepDisplay: true,
          fillColor: '#38ACEC',
          opacity: 0.65,
        },
        displayOverflow: displayOverflow.value,
      }));

    return {
      chartData,
      maxValue,
      minValue,
      decimalPoint,
      isAutoDecimal,
      displayOverflow,
      chartOptions,
      interval,
      useInterval,
      useRange,
      useFixedSteps,
    };
  },
};
</script>

<style lang="scss" scoped>
.description-label {
  vertical-align: top;
  margin-right: 3px;
}

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
