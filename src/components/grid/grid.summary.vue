<template>
  <div
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
            <template v-if="column.summaryRenderer">
              {{ getSummaryRenderer(column) }}
            </template>
            <template v-else>
              {{ getSummaryValue(column, column.summaryType)}}
            </template>
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
import { computed } from 'vue';
import { numberWithComma } from '@/common/utils';

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
  },
  setup(props) {
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
        convertValue = convertValue.toFixed(column.decimal ?? 3);
      }

      return convertValue;
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
          const columnValues = stores.value.store.map(rows => rows[ROW_DATA_INDEX][columnIndex]);
          switch (summaryType) {
            case 'sum':
              result = columnValues.reduce((prev, curr) => {
                const value = Number(curr);
                if (!Number.isNaN(value)) {
                  return prev + curr;
                }
                return prev;
              }, 0);
              break;
            case 'average':
              result = columnValues.reduce((prev, curr) => {
                const value = Number(curr);
                if (!Number.isNaN(value)) {
                  return prev + curr;
                }
                return prev;
              }, 0) / columnValues.length;
              if (result % 1 !== 0) {
                result = result.toFixed(1);
              }
              break;
            case 'max':
              result = Math.max(...columnValues);
              break;
            case 'min':
              result = Math.min(...columnValues);
              break;
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
    return {
      columns,
      styleInfo,
      showCheckbox,
      getSummaryValue,
      getSummaryRenderer,
    };
  },
};
</script>

<style lang="scss" scoped>
@import 'style/grid.scss';
.grid-summary {
  background-color: #F8F9F9;
  border-bottom: 1px solid #CFCFCF;
  .non-border {
    border-bottom: none !important;
  }
  span {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    color: #737373;
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
