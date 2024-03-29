<template>
  <div class="case">
    <ev-grid
      v-model:selected="selected"
      v-model:checked="checked"
      :columns="columns"
      :rows="tableData"
      width="100%"
      height="300"
      :option="{
        adjust: true,
        rowHeight: 45,
        useFilter: false,
        useGridOption: {
          use: true,
        },
        useCheckbox: {
          use: true,
          mode: 'multi',
          headerCheck: true,
        },
        style: {
          border: 'rows',
        },
        page: pageInfo,
        useSummary: true,
      }"
    >
      <template #increment_mb="{ item }">
        {{ getIncrementValue(item) }}
      </template>
    </ev-grid>
    <div class="description">
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">Total (MB)</span>
          <ev-select
            v-model="totalSummaryType"
            :items="summaryTypes"
          />
        </div>
        <div class="form-row">
          <span class="badge yellow">
            Total (MB) Summary Decimal
          </span>
          <ev-input-number
            v-model="totalSummaryDecimal"
            :step="1"
            :min="0"
            :max="20"
          />
        </div>
      </div>
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">Used (MB)</span>
          <ev-select
            v-model="usedSummaryType"
            :items="summaryTypes"
          />
        </div>
        <div class="form-row">
          <span class="badge yellow">
            Used (MB) Summary Decimal
          </span>
          <ev-input-number
            v-model="usedSummaryDecimal"
            :step="1"
            :min="0"
            :max="20"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { numberWithComma } from '@/common/utils';

export default {
  setup() {
    const totalSummaryType = ref('sum');
    const totalSummaryDecimal = ref(1);
    const usedSummaryType = ref('average');
    const usedSummaryDecimal = ref(3);
    const summaryTypes = ref([
      { name: 'sum', value: 'sum' },
      { name: 'average', value: 'average' },
      { name: 'max', value: 'max' },
      { name: 'min', value: 'min' },
      { name: 'count', value: 'count' },
    ]);
    const tableData = ref([]);
    const selected = ref([]);
    const checked = ref([]);
    const columns = ref([
      { caption: 'Name',
        field: 'name',
        type: 'string',
        summaryRenderer: 'Total', // text 만
      },
      { caption: 'Total (MB)',
        field: 'total_mb',
        type: 'number',
        summaryType: totalSummaryType,
        summaryDecimal: totalSummaryDecimal,
        summaryRenderer: 'value: {0}', // text + 해당 컬럼 값 계산
      },
      { caption: 'Used (MB)',
        field: 'used_mb',
        type: 'number',
        summaryDecimal: usedSummaryDecimal,
        summaryType: usedSummaryType, // type 만 지정
      },
      { caption: 'Increment (MB)',
        field: 'increment_mb',
        type: 'number',
        summaryType: 'sum',
        summaryData: ['diff'],
        summaryRenderer: '{0}({1}%)', // 다른 컬럼과 같이 계산
      },
      { caption: 'Diff', field: 'diff', type: 'float', decimal: 1, hide: true },
    ]);
    tableData.value = [
      ['HIDB_DATA_1', 30000.12, 27506, 7185, 2000.7],
      ['HIDB_DATA_2', 29000.234, 23659, 0, 1500],
      ['HIDB_LARGE_1', 28000.3456, 21695, 1185, -4.7],
      ['HIDB_INDEX_1', 27000.45678, 23685, 0, 0],
      ['HIDB_INDEX_2', 26000.567891, 23535, 0, 0],
      ['HIDB_INDEX_3', 25000, 23659, 0, 0],
      ['HIDB_L_INDEX_1', 24000, 23695, 0, 0],
      ['HIDB_L_INDEX_2', 23000, 21691, 0, 0],
      ['HIDB_L_INDEX_3', 22000, 20021, 0, 0],
      ['HIDB_DATA_3', 21000, 14485, 0, 0],
      ['HIDB_DATA_4', 20000, 14396, 2185, -11],
      ['SYSAUX', 11000, 9485, 0, -11],
      ['USERS', 10000, 6485, 0, 0],
      ['UNDOTBS1', 9000, 3486, 0, 0],
    ];
    const pageInfo = reactive({
      use: false,
      perPage: 8,
      total: computed(() => tableData.value.length),
      useClient: true,
    });
    const getIncrementValue = (item) => {
      const row = item.row[2];
      const columnIndex = item.column.index;
      let floatValue = row[columnIndex + 1];
      floatValue = floatValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${numberWithComma(row[columnIndex])}(${floatValue}%)`;
    };
    return {
      columns,
      tableData,
      selected,
      checked,
      pageInfo,
      totalSummaryType,
      totalSummaryDecimal,
      summaryTypes,
      usedSummaryType,
      usedSummaryDecimal,
      getIncrementValue,
    };
  },
};
</script>

<style lang="scss" scoped>
.form-rows {
  display: flex;
}
.form-row {
  flex: 1;
  margin: 5px;
  .badge {
    margin-bottom: 3px;
  }
}
.ev-toggle {
  display: block;
}
</style>
