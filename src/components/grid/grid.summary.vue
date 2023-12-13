<template>
  <div
    ref="summaryRef"
    :class="{
      'grid-summary': true,
      'non-border': styleInfo.borderStyle === 'none',
    }"
  >
    <ul class="column-list">
      <li
        v-if="showCheckbox"
        :class="{
          'column': true,
          'non-border': !!styleInfo.borderStyle,
        }"
        :style="{
          'width': `${styleInfo.minWidth}px`,
          'line-height': `${styleInfo.rowHeight}px`
        }"
      >
        <span :style="{'height': `${styleInfo.rowHeight}px`}" />
      </li>
      <template
        v-for="(column, index) in columns"
        :key="`summary_${index}`"
      >
        <li
          v-if="!column.hide"
          :class="{
            column: true,
            'non-border': !!styleInfo.borderStyle,
            [column.type]: column.type,
            [column.align]: column.align,
          }"
          :style="{
            width: `${column.width}px`,
            'min-width': `${styleInfo.minWidth}px`,
            'line-height': `${styleInfo.rowHeight}px`,
          }"
        >
          <span
            v-if="column.summaryType || column.summaryRenderer"
            :style="{
              width: '100%',
              height: `${styleInfo.rowHeight}px`,
            }"
          >
            <div
              v-if="column.summaryRenderer"
              :title="getSummaryRenderer(column)"
            >
              {{ getSummaryRenderer(column) }}
            </div>
            <div
              v-else
              :title="getSummaryValue(column, column.summaryType)"
            >
              {{ getSummaryValue(column, column.summaryType)}}
            </div>
          </span>
          <span
            v-else
            :style="{'height': `${styleInfo.rowHeight}px`}"
          />
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import { computed, watch, ref, nextTick } from 'vue';
import { numberWithComma } from '@/common/utils';
import BigNumber from 'bignumber.js';

export default {
  name: 'EvGridSummary',
  props: {
    stores: {
      type: Object,
      default: () => ({}),
    },
    orderedColumns: {
      type: Object,
      default: () => ({}),
    },
    useCheckbox: {
      type: Boolean,
      default: false,
    },
    styleOption: {
      type: Object,
      default: () => ({}),
    },
    isTree: {
      type: Boolean,
      default: false,
    },
    scrollLeft: {
      type: Number,
      default: 0,
    },
    decimal: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const summaryRef = ref();
    const ROW_DATA_INDEX = 2;
    const stores = computed(() => props.stores);
    const columns = computed(() => props.orderedColumns);
    const showCheckbox = computed(() => props.useCheckbox);
    const styleInfo = computed(() => props.styleOption);
    const getConvertValue = (column, value) => {
      let convertValue = value;

      if (column.type === 'number') {
        convertValue = numberWithComma(value);
        convertValue = convertValue === false ? value : convertValue;
      } else if (column.type === 'float') {
        const floatValue = convertValue.toFixed(column.decimal ?? 3);
        convertValue = floatValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      return convertValue;
    };
    const getSumValueWithBigNumber = (
      num1, num2,
    ) => new BigNumber(num1).plus(new BigNumber(num2)).toNumber();

    const getDivideValueWithBigNumber = (
      dividend, divisor,
    ) => new BigNumber(dividend).dividedBy(new BigNumber((divisor))).toNumber();

    const getFloorValueWithBigNumber = (
      num, decimal,
    ) => new BigNumber(num).decimalPlaces(decimal, BigNumber.ROUND_DOWN).toNumber();

    const bigNumberCalculation = {
      sum: getSumValueWithBigNumber,
      divide: getDivideValueWithBigNumber,
      floor: getFloorValueWithBigNumber,
    };

    const getColumnIndex = field => columns.value.findIndex(column => column.field === field);
    const getSummaryValue = (column, summaryType) => {
      let result = '';
      const columnIndex = getColumnIndex(column.field);
      if (columnIndex >= 0) {
        if (summaryType === 'count') {
          return stores.value.store.length;
        }
        if (column.type === 'number' || column.type === 'float') {
          let columnValues = [];
          if (props.isTree) {
            columnValues = stores.value.store.map(node => node.data?.[column.field]);
          } else {
            columnValues = stores.value.store.map(row => row[ROW_DATA_INDEX][columnIndex]);
          }
          switch (summaryType) {
            case 'sum': {
              const sumValue = columnValues.reduce((prev, curr) => {
                const value = Number(curr);
                if (!Number.isNaN(value)) {
                  return bigNumberCalculation.sum?.(prev, value);
                }
                return prev;
              }, 0);
              result = bigNumberCalculation.floor?.(sumValue, (props.decimal ?? 0));
              break;
            }
            case 'average': {
              const sumValue = columnValues.reduce((prev, curr) => {
                const value = Number(curr);
                if (!Number.isNaN(value)) {
                  return bigNumberCalculation.sum?.(prev, value);
                }
                return prev;
              }, 0);
              result = bigNumberCalculation.divide?.(sumValue, columnValues.length);
              if (result % 1 !== 0) {
                result = result.toFixed(1);
              }
              break;
            }
            case 'max': {
              const filteredNullValues = columnValues.filter(value => value != null);
              result = filteredNullValues.length ? Math.max(...filteredNullValues) : '';
              break;
            }
            case 'min': {
              const filteredNullValues = columnValues.filter(value => value != null);
              result = filteredNullValues.length ? Math.min(...filteredNullValues) : '';
              break;
            }
            default:
              break;
          }
          result = getConvertValue(column, result);
        }
      }
      return result;
    };
    const getSummaryRenderer = (column) => {
      const str = column.summaryRenderer;
      const summaryData = column.summaryData ? column.summaryData : [];
      const fields = [column.field, ...summaryData];
      let result = str;
      fields.forEach((name, idx) => {
        const columnIndex = getColumnIndex(name);
        if (columnIndex >= 0) {
          const value = getSummaryValue(
            stores.value.orderedColumns[columnIndex],
            column.summaryType,
          );
          result = result.replace(`{${idx}}`, value);
        }
      });
      return result;
    };
    watch(
      () => props.scrollLeft,
      (val) => {
        nextTick(() => {
          summaryRef.value.scrollLeft = val;
        });
      },
    );
    return {
      columns,
      styleInfo,
      showCheckbox,
      summaryRef,
      getSummaryValue,
      getSummaryRenderer,
    };
  },
};
</script>

<style lang="scss" scoped>
@import 'style/grid.scss';
.grid-summary {
  width: 100%;
  overflow: hidden;

  @include evThemify() {
    border-bottom: 1px solid evThemed('disabled');
    background-color: evThemed('background-lighten');
  }
  .non-border {
    border-bottom: none !important;
  }
  span {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    > div {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @include evThemify() {
      color: evThemed('font-color-base');
    }
  }
  .column {
    &.number,
    &.float {
      text-align: right;
    }
    &.string,
    &.stringNumber {
      text-align: left;
    }
    &.center {
      text-align: center;
    }
    &.left {
      text-align: left;
      .wrap {
        justify-content: flex-start;
      }
    }
    &.right {
      text-align: right;
      .wrap {
        justify-content: flex-end;
      }
    }
  }
}
</style>
