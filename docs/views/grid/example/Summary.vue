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
        adjust: false,
        rowHeight: 45,
        useFilter: false,
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
          <span class="badge yellow">Used (MB)</span>
          <ev-select
            v-model="usedSummaryType"
            :items="summaryTypes"
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
    const usedSummaryType = ref('average');
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
        summaryRenderer: 'value: {0}', // text + 해당 컬럼 값 계산
      },
      { caption: 'Used (MB)',
        field: 'used_mb',
        type: 'number',
        summaryType: usedSummaryType, // type 만 지정
      },
      { caption: 'Increment (MB)',
        field: 'increment_mb',
        type: 'number',
        summaryType: 'sum',
        summaryData: ['diff'],
        summaryRenderer: '{0}({1}%)', // 다른 컬럼과 같이 계산
      },
      { caption: 'Diff', field: 'diff', type: 'float', decimal: 1, hide: false },
      { caption: 'test',
        field: 'test1',
        type: 'number',
        summaryType: 'sum',
      },
      { caption: 'test',
        field: 'test2',
        type: 'number',
        summaryType: 'sum',
      },
      { caption: 'test',
        field: 'test3',
        type: 'number',
        summaryType: 'sum',
      },
      { caption: 'test',
        field: 'test4',
        type: 'number',
        summaryType: 'sum',
      },
      { caption: 'test',
        field: 'test5',
        type: 'number',
        summaryType: 'sum',
      },
    ]);
    tableData.value = [
      ['HIDB_DATA_1', 30000, 27506, 7185, 2000, 1, 1, 1, 2, 3],
      ['HIDB_DATA_2', 29000, 23659, 0, 0, 1, 1, 1, 2, 3],
      ['HIDB_LARGE_1', 28000, 21695, 1185, -4.7, 1, 1, 1, 2, 3],
      ['HIDB_INDEX_1', 27000, 23685, 0, 0, 1, 1, 1, 2, 3],
      ['HIDB_INDEX_2', 26000, 23535, 0, 0, 1, 1, 1, 2, 3],
      ['HIDB_INDEX_3', 25000, 23659, 0, 0, 1, 1, 1, 2, 3],
      ['HIDB_L_INDEX_1', 24000, 23695, 0, 0, 1, 1, 1, 2, 3],
      ['HIDB_L_INDEX_2', 23000, 21691, 0, 0, 1, 1, 1, 2, 3],
      ['HIDB_L_INDEX_3', 22000, 20021, 0, 0, 1, 1, 1, 2, 3],
      ['HIDB_DATA_3', 21000, 14485, 0, 0, 1, 1, 1, 2, 3],
      ['HIDB_DATA_4', 20000, 14396, 2185, -11, 1, 1, 1, 2, 3],
      ['SYSAUX', 11000, 9485, 0, -11, 1, 1, 1, 2, 3],
      ['USERS', 10000, 6485, 0, 0, 1, 1, 1, 2, 3],
      ['UNDOTBS1', 9000, 3486, 0, 0, 1, 1, 1, 2, 3],
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
      summaryTypes,
      usedSummaryType,
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
