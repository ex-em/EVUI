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
              :title="getSummaryValue(column)"
            >
              {{ getSummaryValue(column)}}
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
import { bnDivide, bnFloor, bnPlus } from '@/common/utils.bignumber';

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
  },
  setup(props) {
    const DECIMAL = {
      max: 20,
      default: 3,
    };
    const summaryRef = ref();
    const ROW_DATA_INDEX = 2;
    const stores = computed(() => props.stores);
    const columns = computed(() => props.orderedColumns);
    const showCheckbox = computed(() => props.useCheckbox);
    const styleInfo = computed(() => props.styleOption);

    const getValidDecimal = (decimal) => {
      if (decimal == null || decimal < 0) {
        return DECIMAL.default;
      }

      if (decimal > DECIMAL.max) {
        return DECIMAL.max;
      }

      return decimal;
    };

    const getConvertValue = (column, value) => {
      if (typeof value === 'string' && value.length === 0) {
        return value;
      }

      const { type, decimal } = column;
      let convertValue = value;

      if (type === 'number') {
        convertValue = numberWithComma(value);
        convertValue = convertValue === false ? value : convertValue;
      } else if (type === 'float') {
        const floatValue = convertValue.toFixed(getValidDecimal(decimal ?? DECIMAL.default));
        convertValue = floatValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      return convertValue;
    };

    const getColumnIndex = field => columns.value.findIndex(column => column.field === field);
    const getSummaryValue = (column) => {
      const {
        type,
        field,
        summaryType,
        summaryDecimal,
      } = column;

      let result = '';
      const columnIndex = getColumnIndex(field);
      if (columnIndex >= 0) {
        if (summaryType === 'count') {
          return stores.value.store.length;
        }
        if (type === 'number' || type === 'float') {
          let columnValues = [];
          if (props.isTree) {
            columnValues = stores.value.store.map(node => node.data?.[field]);
          } else {
            columnValues = stores.value.store.map(row => row[ROW_DATA_INDEX][columnIndex]);
          }
          switch (summaryType) {
            case 'sum': {
              const sumValue = columnValues.reduce((prev, curr) => {
                const value = Number(curr);
                if (!Number.isNaN(value)) {
                  return bnPlus(prev, value);
                }
                return prev;
              }, 0);

              result = sumValue && bnFloor(
                sumValue, getValidDecimal(summaryDecimal ?? DECIMAL.default),
              );
              break;
            }
            case 'average': {
              const sumValue = columnValues.reduce((prev, curr) => {
                const value = Number(curr);
                if (!Number.isNaN(value)) {
                  return bnPlus(prev, value);
                }
                return prev;
              }, 0);
              result = sumValue && bnFloor(
                bnDivide(sumValue, columnValues.length),
                getValidDecimal(summaryDecimal ?? DECIMAL.default),
              );
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
          const value = getSummaryValue(stores.value.orderedColumns[columnIndex]);
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
